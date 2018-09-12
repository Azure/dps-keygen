## Azure IoT DPS Symmetric Key Generator

Helper tool to device SAS key and connection string.

### Install

```
npm i -g dps-keygen
```

### Usage

dps-keygen is an interfactive tool. Simply run and execute.

```
dps-keygen <Primary_Key(GroupSAS)> <device_id>
```

The command above will create you a `Primary Key(for device)`.
In order to create a **connection string**, find your binary under `bin/` folder.
```
dps_cstr <scope_id> <device_id> <Primary Key(for device)>
```

Alternatively, `dps-keygen` tool, lets you to 'over the air' configure an updated mxchip device.
Below are the options to do that;

```
dps-keygen <Primary_Key(GroupSAS)> <device_id> <scope_id> <wifi ssid> <wifi pass> <pincode(given on the device LCD)>;
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
