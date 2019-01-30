#!/usr/bin/env node
// ----------------------------------------------------------------------------
//  Copyright (C) Microsoft. All rights reserved.
//  Licensed under the MIT license.
// ----------------------------------------------------------------------------

const colors   = require('colors');
const crypto   = require('crypto');
const fs       = require('fs');
const path     = require('path');
const isBase64 = require('is-base64');
const request  = require('request');
const wifi     = require('node-wifi');

var MASTERKEY = "", BASEREGID = "", SCOPEID = "", SSID = "", PASSWD = "", PINCODE = null;
var urlencode = encodeURIComponent;

function computeDrivedSymmetricKey(masterKey, regId) {
  return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
    .update(regId, 'utf8')
    .digest('base64');
}

async function main() {
  var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
  console.log(`\nAzure IoT DPS Symetric Key Generator v${version}`);

  if (process.argv.length < 4) {
    console.log("Usage:");
    console.log(colors.bold("dps-keygen"), "<primary/secondary-key>", "<deviceId>");
    console.log("\nYou may also create a connection string using the device key and scope Id");
    console.log(colors.bold("dps-keygen"), "<device key>", "<deviceId>", "<scope id>");
    console.log("\nYou may also 'over the air' configure an updated mxchip device. Below are the options to do that");
    console.log(colors.bold("dps-keygen"), "<primary/secondary-key>", "<deviceId>", "<opt scope id>", "<opt ssid>", "<opt pass>", "<opt pincode>");
    process.exit(0);
  }

  MASTERKEY = process.argv[2];
  BASEREGID = process.argv[3];

  if (!isBase64(MASTERKEY)) {
    console.error(colors.red('\nerror :'), "invalid entry");
    console.log("\texpects a base64 encoded master key");
    process.exit(1);
  }

  console.log("MASTER-KEY:", MASTERKEY);
  console.log("BASE-DEVICE-ID:", BASEREGID);

  if (process.argv.length >= 7) {
    console.log("Scanning Devices...");
    SCOPEID = urlencode(process.argv[4]);
    SSID = urlencode(process.argv[5]);
    PASSWD = urlencode(process.argv[6]);
    PINCODE = process.argv[7];

    updateDevices();
  } else {
    if (process.argv.length == 5) {
      require('./dps.js').getConnectionString(BASEREGID, MASTERKEY, process.argv[4], false, function(error, connstr) {
        if (error) {
          console.log(error)
        } else {
          console.log("Connection String:\n\n", connstr)
        }
      })
    } else {
      console.log("\nplease find the device key below.")
      console.log(computeDrivedSymmetricKey(MASTERKEY + "", BASEREGID + ""), "\n");
    }
  }
}

var RUN = 1;
main();

function updateDevices() {
  wifi.init({
      iface : null // network interface, choose a random wifi interface if set to null
  });

  var mxnetworks = [];

  function doconnect() {
    if (mxnetworks.length == 0) { if (RUN < 3) updateDevices(); else return; }
    var net = mxnetworks.pop();
    if (!net) {
      setTimeout(doconnect, 1000);
      RUN++;
      return;
    }
    wifi.connect({ssid:net.ssid, password:""}, function(err) {
      var mac = net.bssid.split(':');
      var PINCO = mac[mac.length - 2].toUpperCase() + mac[mac.length - 1].toUpperCase();
      var REGID;
      if (PINCODE == "ALL") {
        console.log("network ssid:", net.ssid)
        console.log("Updating..");
        REGID = urlencode(BASEREGID + mac[mac.length - 2] + mac[mac.length - 1]);
      } else {
        if (PINCO != PINCODE) err = 1;
        REGID = BASEREGID;
      }
      if (err) {
        setTimeout(doconnect, 1000);
        RUN++;
      }
      SASKEY = computeDrivedSymmetricKey(MASTERKEY + "", REGID + "");
      SASKEY = urlencode(SASKEY);

      var connstr = `http://192.168.0.1/PROCESS?SSID=${SSID}&PASS=${PASSWD}&PINCO=${PINCO}&SCOPEID=${SCOPEID}&REGID=${REGID}&AUTH=S&SASKEY=${SASKEY}&HUM=1&MAG=1&GYRO=1&TEMP=1&PRES=1&ACCEL=1`;

      process.stdout.write('.');
      var doitCount = 0;
      function doit() {
          request(connstr, {timeout: 10000}, function (error, response, body) {
            process.stdout.write('.');
            if (!error || doitCount != 0) {
              setTimeout(function() {
                console.log("done! deviceid:", REGID);
                if (PINCODE != "ALL") {
                  doconnect();
                } else {
                  process.exit(0);
                }
              }, 1000);
            } else {
              doitCount++;
              setTimeout(doit, 1000);
            }
          });
      }
      setTimeout(doit, 2000);
    });
  }

  // Scan networks
  wifi.scan(function(err, networks) {
      if (err) {
          console.log("Couldn't scan network. Try disconnecting from your current WiFi hotspot?");
      } else {
        for(var o in networks) {
          var network = networks[o];
          if (network.ssid.indexOf('AZ3166_') == 0) {
            mxnetworks.push(network);
          }
        }

        if (mxnetworks.length == 0) {
          if (RUN == 1) {
            console.log("No MXCHIP broadcast was found. Have you reset them to AP mode?");
          }
        }
        doconnect();
      }
  });
}
