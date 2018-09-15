## Azure IoT DPS Symmetric Key Generator

Helper tool to device SAS key and connection string.

### Install

```
npm i -g dps-keygen
```

### Usage

dps-keygen is a simple tool to create a self sufficient device authentication key from the `Primary/Secondary_Key(GroupSAS)` (check your Azure IoT account) and your choice of `device id` (no caps)

```
dps-keygen <Primary/Secondary_Key(GroupSAS)> <device_id>
```

The command above will create you a `Device key`.

#### Creating connection strings

You will need the `Device key` that you have created using the `dps-keygen` solution mentioned above.

You will need a platform dependent `dps_cstr` binary under `bin/` folder of this repository to create a connection string.
```
dps_cstr <scope_id> <device_id> <Device key>
```

Once you run `dps_cstr`, it will try to register your device to your account through Azure IoT DPS service. In order to receive a connection string, please make sure that you have `associated the devices`

i.e. If you are using this tool with `Azure IoT Central` please visit `Unassociated devices` tab on your account once you start `dps_cstr` tool and make sure you have associated it with the matching template.

#### Over the Air device configuration

Alternatively, `dps-keygen` tool, lets you to 'over the air' configure an updated mxchip device. (2.0.0+)

Below are the options to do that;

```
dps-keygen <Primary_Key(GroupSAS)> <device_id> <scope_id> <wifi ssid> <wifi pass> <pincode(given on the device LCD)>;
```

Reminder; `pincode` is case sensitive. Alternatively you may set `ALL` to `pincode` to configure all the devices around at once. If you do that, `device id` will be the prefix for the devices to be configured.

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
