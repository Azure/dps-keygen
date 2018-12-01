### Connection String Generator for Linux

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
a7736d325978606caeb9aa33463e7f2b03657460b68a615796a456f4501b258c
```
