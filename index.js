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

async function ask() {
  var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
  console.log(`\nAzure IoT DPS Symetric Key Generator v${version}`);

  if (process.argv.length < 4) {
    console.log("Usage:");
    console.log(colors.yellow("dps-keygen"), "<master-key>", "<registrationId>");
    process.exit(0);
  }

  var masterKey = process.argv[2];
  var registrationId = process.argv[3];

  if (!isBase64(masterKey)) {
    console.error(colors.red('\nerror :'), "invalid entry");
    console.log("\texpects a base64 encoded master key");
    process.exit(1);
  }

  console.log("MASTER-KEY:", masterKey);
  console.log("Registration-ID:", registrationId);

  function computeDrivedSymmetricKey(masterKey, registrationId) {
    return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
      .update(registrationId, 'utf8')
      .digest('base64');
  }

  console.log("\nplease find the device key below.")
  console.log(colors.magenta(computeDrivedSymmetricKey(masterKey + "",
            registrationId + "")), "\n");
}

ask();