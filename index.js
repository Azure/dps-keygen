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
  console.log('-mk:<masterKey> : admin primary or secondary key');
  console.log('\ni.e. => dps-keygen -di:dev1 -mk:masterkeyhere');
}

async function main() {
  var version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
  console.log(`\nAzure IoT DPS Symetric Key Generator v${version}`);

  if (process.argv.length < 4) {
    showUsage();
    process.exit(0);
  }

  var args = {
    '-mk': 0,
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

  if (!args['-mk']) {
    console.error('ERROR: You haven\'t defined the master key.');
    process.exit(1);
  }
  if (!args['-di']) {
    console.error('ERROR: You haven\'t defined the device id.');
    process.exit(1);
  }

  if (args['-mk'] && args['-di']) {
    console.log('\nPlease find the device key below.');
    console.log(computeDrivedSymmetricKey(args['-mk'] + '', args['-di'] + ''), '\n');
  } else {
    showUsage();
    process.exit(1);
  }
}

main();
