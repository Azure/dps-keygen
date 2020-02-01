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
dps-keygen <args>

args:
-di:<deviceId> : device id
-mk:<masterKey> : admin primary or secondary key
```


### Calculating a device key from admin/master key

This operation doesn't require an active connection. However, you will need the
master/admin (primary/secondary) key at your presence.

`Device Id` below is up to you. Make sure it's unique.

```
dps-keygen -mk:put_master_key_here -di:ie_dev1
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
