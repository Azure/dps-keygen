## This repository is archived

This tool is no longer supported and will no longer be maintained.  This code should not be used as it circumvents the use of DPS and if connection strings are hard coded into your device firmware then over time your devices will likely not be able to connect to IoT Central.  Without DPS devices cannot connect to IoT Central applications that use multiple IoT Hubs for high availability and scaling.

## Azure IoT DPS Symmetric Key Generator

Helper tool to create device SAS key and/or connection string.

### Warning

DPS Keygen should no longer be used for Azure IoT Central.  Azure IoT Central uses the Device Provisioning Service (DPS) to route the device connection to the right Azure IoT hub instance.  Since IoT Central now supports multiple hubs for high availability and disaster recovery (HADR) it is essential that you do not hard code connection strings or IoT hub host names into your device code.  The ability to generate a connection string using this tool has been deprecated and the only functionality available in this tool is the ability to generate individual device keys from your IoT Central applications group SAS key.  For production devices we strongly recommend the use of X.509 certificates for the best device security.

For more information on IoT Centrals high availability and disaster recover feature [click here](https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-best-practices)


### Requirements

node.js version 8+


### Install

```
npm i -g dps-keygen
```

### Usage

```
dps-keygen <args>

args:
-di:<deviceId> : device id
-dk:<deviceKey> : device primary or secondary key
-mk:<masterKey> : admin primary or secondary key
-si:<scopeId> : scope id
-mr:<uri> : model repository uri
-mc:<uri> : model capability uri. Leave blank if its value is similar to model rep. uri.
-mi:<modelId> : model id
```


### Calculating a device key from admin/master key

This operation doesn't require an active connection. However, you will need the
master/admin (primary/secondary) key at your presence.

`Device Id` below is up to you. Make sure it's unique.

```
dps-keygen -mk:put_master_key_here -di:ie_dev1
```

### Retrieve hub connection string [<span style="color:red">deprecated</span>]
The connection string retrieval feature is **deprecated**.
On **January 31st 2020** this feature will no longer be available in this tool. IoT Central best practice is to use DPS (Device Provisioning Service) for connecting devices. You can find more details about connecting to IoT Central with DPS at [https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-connectivity](https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-connectivity)

```
dps-keygen -di:dev1 -dk:devicekeyhere -si:scopeidhere
```

### Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
