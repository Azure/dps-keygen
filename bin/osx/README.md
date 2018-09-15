### Connection String Generator for OSX

`dps_cstr` creates a connection string from a primary `device` key.

```
dps_cstr <scope_id> <device_id> <Primary Key(for device)>
```

If you want to check the integrity of the binary file on terminal;
```
SHASUM -a 256 dps_cstr
```

Output should be matching to the hash below.
```
4ba32ef6e51af0b2d3a43c93611b5a39aeea98941e2dbc6d4e8dd9c019f9826d
```
