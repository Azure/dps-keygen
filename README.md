## Azure IoT DPS Symmetric Key Generator

Helper tool to create master and device GroupSAS keys.

### Install

```
npm i -g dps-keygen
```

### Usage

dps-keygen is an interfactive tool. Simply run and execute.

```
dps-keygen <master_key> <registration_id>
```

The command above will create you a `device_key`.
In order to create a connection string, find your binary under `bin/` folder.
```
dps_cstr <scope_id> <registration_id> <device_key>
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
