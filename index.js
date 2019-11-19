#!/usr/bin/env node
// ----------------------------------------------------------------------------
//  Copyright (C) Microsoft. All rights reserved.
//  Licensed under the MIT license.
// ----------------------------------------------------------------------------

const colors = require('colors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function computeDrivedSymmetricKey(masterKey, regId) {
  return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
    .update(regId, 'utf8')
    .digest('base64');
}

function showUsage() {
  console.log('Usage:');
  console.log(colors.bold('dps-keygen'), '<args>');
  console.log('\nargs:\n-di:<deviceId> : device id');
  console.log('-dk:<deviceKey> : device primary or secondary key');
  console.log('-mk:<masterKey> : admin primary or secondary key');
  console.log('-si:<scopeId> : scope id');
  console.log('-mr:<uri> : model repository uri');
  console.log('-mc:<uri> : model capability uri. Leave blank if its value is similar to model rep. uri.');
  console.log('-mi:<modelId> : model id');
  console.log('\ni.e. => dps-keygen -di:dev1 -dk:devicekeyhere -si:scopeidhere');
}

async function main() {
  var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
  console.log(`\nAzure IoT DPS Symetric Key Generator v${version}`);

  if (process.argv.length < 4) {
    showUsage();
    process.exit(0);
  }

  var args = {
    '-dk': 0,
    '-mk': 0,
    '-si': 0,
    '-mi': 0,
    '-mc': 0,
    '-mr': 0,
    '-di': 0
  };

  for (var i = 1; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg.startsWith('-')) {
      if (arg.startsWith('--')) {
        arg = arg.substr(1);
      }
      var st = arg.length > 3 ? arg.substr(0, 3) : 0;
      if (st && args.hasOwnProperty(st)) {
        args[st] = arg.substr(4, arg.length - 4);
      }
    }
  }

  if (args['-dk'] && args['-mk']) {
    console.error('ERROR: You can\'t use both master key and device key.');
    process.exit(1);
  } else if (!args['-dk'] && !args['-mk']) {
    console.error('ERROR: You haven\'t defined neither the master key or device key.');
    process.exit(1);
  }

  if (args['-mk'] && args['-di'] && !args['-si']) {
    console.log('\nPlease find the device key below.');
    console.log(computeDrivedSymmetricKey(args['-mk'] + '', args['-di'] + ''), '\n');
  } else if (args['-si'] && args['-di']) {
    // alert deprecation
    console.log('\x1b[31m%s\x1b[0m', '\nDeprecated Feature:');
    console.log('The connection string retrieval feature is deprecated.\nOn January 31st 2020 this feature will no longer be available in this tool.\nIoT Central best practice is to use DPS (Device Provisioning Service) for connecting devices.\nYou can find more details about connecting to IoT Central with DPS at:');
    console.log('\x1b[34m%s\x1b[0m', 'https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-connectivity\n\n');

    var key = args['-mk'] ? args['-mk'] : args['-dk'];
    var master = args['-mk'] ? true : false;
    var modelBlob = null;
    if (args['-mr']) {
      modelBlob = {
        '__iot:interfaces': {
          'ModelRepositoryUri': args['-mr']
        }
      };
      if (args['-mc']) {
        modelBlob['__iot:interfaces'].CapabilityModelUri = args['-mc'];
      } else {
        modelBlob['__iot:interfaces'].CapabilityModelUri = args['-mr'];
      }
    }

    if (args['-mi']) {
      if (modelBlob == null) {
        modelBlob = {};
      }
      modelBlob['iotcModelId'] = args['-mi'];
    }

    require('./dps.js').getConnectionString(args['-di'], key, args['-si'],
      modelBlob, master, function (error, connstr) {
        if (error) {
          // when the inputs are absurd, server may not respond
          if (error instanceof Buffer) {
            if (error.length == 0) {
              error = 'empty response from server. check your credentials.';
            } else {
              error = error.toString('utf8');
            }
          }
          console.log('Error:', error);
          process.exit(1);
        } else {
          console.log('Connection String:\n\n', connstr.toString());
        }
      });
  } else {
    showUsage();
    process.exit(1);
  }
}

main();
