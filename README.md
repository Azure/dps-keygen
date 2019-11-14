## Azure IoT DPS Symmetric Key Generator

Helper tool to create device SAS key and/or connection string.

### Requirements

node.js version 8+


### Install

```
npm i -g dps-keygen
```

### Usage

```
> dps-keygen --help

Commands:
  dps-keygen generate-device-key              Generate a device key from a master
                                            key
  dps-keygen get-connection-string [options]  Get IoT Hub connection string for
                                            the device  [deprecated]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

### Calculating a device key from admin/master key

Master/admin key can be found in the Administrator section of the IoTCentral application.

`DeviceId` must be unique.

```
> dps-keygen generate-device-key

Generate a device key from a master key

Options:
  --version       Show version number                                  [boolean]
  --help          Show help                                            [boolean]
  --key, -k       Master key for the application             [string] [required]
  --deviceId, -d  Device Id                                  [string] [required]

```

```
> dps-keygen --key "<master-key>" --deviceId "<device id>"
```

### Getting IoTHub connection string [ <span style="color:red;">deprecated!!</span> ]

This operation provisions a device to Azure IoTCentral and gives back the Azure IoTHub connection string the device is using to connect.
If device is already provisioned the result is returned immediately.

Passing a valid template ID, the operation provisions the new device with the right template association.
If autoapproval is enabled result is returned when provisioning succeeds, otherwise it waits for approval to manually happen.

<span style="color:black;background-color:yellow">
This feature is deprecated and will be dismissed on <span style="color:red">Jan 31 2020.</span></br>
IoTHub connection strings should not be used when connecting to Azure IoTCentral.</br>
IoTCentral relies on Azure DPS (Device Provisioning Service) to manage connections.More details available <a href="https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-connectivity">here.</a></span>

```
> dps-keygen get-connection-string --help

Get IoT Hub connection string for the device [deprecated]

Options:
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
  --scopeId, -s     Application scope Id                     [string] [required]
  --deviceId, -i    Device Id                                [string] [required]
  --deviceKey, -d   Device key                                          [string]
  --masterKey, -m   Master key                                          [string]
  --templateId, -t  IoT Central template Id to associate device         [string]

```

```
> dps-keygen get-connection-string --scopeId "<scopeId>" --deviceId "<deviceId>" [options]
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
