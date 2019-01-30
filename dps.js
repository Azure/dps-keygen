// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

"use strict"

var Client = require('node-rest-client').Client;
const crypto   = require('crypto');

function computeDrivedSymmetricKey(masterKey, regId) {
  return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
    .update(regId, 'utf8')
    .digest('base64');
}

function loopAssign(data, client, args, deviceId, scopeId, deviceKey, callback) {
  var URI = `https://global.azure-devices-provisioning.net/\
${scopeId}/registrations/${deviceId}/operations/${data.operationId}?api-version=2018-09-01-preview`;
  client.get(URI, args, function (data, response) {
        if (data.status == 'assigning') {
          setTimeout(function() {
            loopAssign(data, client, args, deviceId, scopeId, deviceKey, callback);
          }, 2000);
        } else if (data.status == "assigned") {
          var state = data.registrationState;
          var hub = state.assignedHub;
          callback(undefined, "HostName=" + hub + ";DeviceId=" + deviceId + ";SharedAccessKey=" + deviceKey)
        } else {
          callback(data)
        }
    });
}

exports.EXPIRES = 30; // 30 mins

exports.getConnectionString = function(deviceId, key, scopeId, isMasterKey, callback) {
  var expires = parseInt((Date.now() + (exports.EXPIRES * 1000)) / 1000);

  var deviceKey = isMasterKey ? computeDrivedSymmetricKey(key, "dev1") : key;
  var sr = `${scopeId}%2fregistrations%2f${deviceId}`;
  var sigNoEncode = computeDrivedSymmetricKey(deviceKey, `${sr}\n${expires}`)
  var sigEncoded = encodeURIComponent(sigNoEncode);

  var args = {
    data: `{"registrationId":"${deviceId}"}`,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
      "Connection": "keep-alive",
      "UserAgent": "prov_device_client/1.0",
      "Authorization" : `SharedAccessSignature sr=${sr}&sig=${sigEncoded}&se=${expires}&skn=registration`
    }
  };

  var client = new Client();
  client.put(`https://global.azure-devices-provisioning.net/${scopeId}/registrations/${deviceId}/register?api-version=2018-11-01`,
    args, function (data, response) {
      delete args.data
      if (!response.error && !data.errorCode) {
        setTimeout(function() { loopAssign(data, client, args, deviceId, scopeId, deviceKey, callback) }, 2000);
      } else {
        callback(response.error ? response.error : data);
      }
    });
}