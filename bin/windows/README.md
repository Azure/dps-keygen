### Connection String Generator for Windows (compressed)

`dps_cstr` creates a connection string from a primary `device` key.

```
dps_cstr <scope_id> <device_id> <Primary Key(for device)>
```

If you want to check the integrity of the binary file on Windows;
```
Get-FileHash dps_cstr.zip -Algorithm SHA256
```

Output should be matching to the hash below.
```
897ec8dbec1db0eb0a93bda185de4e8ab124f395db4c94e8c227e72596b7d7f5
```
