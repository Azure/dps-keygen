### How to use Azure IoT DPS Symm Key interface for Azure IoT C SDK

Clone the Azure IOT C SDK
```
git clone --recursive https://github.com/azure/azure-iot-sdk-c
```

Update `azure-iot-sdk-c/provisioning_client/samples/prov_dev_client_ll_sample/prov_dev_client_ll_sample.c`
with `code.c` on this folder.

Make sure your environment has the build dependencies.

[CLICK to check the DEPENDENCIES](https://github.com/Azure/azure-iot-sdk-c/blob/dps_symm_key/iothub_client/readme.md#compiling-the-c-device-sdk)

*If you are planning to build this on linux/unix, simply follow the steps below; otherwise,*
*previous link has details for compiling on Windows. Please make sure that you*
*have enabled `-Duse_prov_client:BOOL=ON` similar to steps given below*

Prepare the build
```
mkdir build && cd build
cmake -Duse_prov_client:BOOL=ON ..
```

Build!
```
make -j
```

find the binary `prov_dev_client_ll_sample` under the build folder
```
find . -name 'prov_dev_client_ll_sample'
```

Possibly, you will find it under `./provisioning_client/samples/prov_dev_client_ll_sample/prov_dev_client_ll_sample`

Run it!

### How it works?

On the sample project (`code.c`), we have used the `device id`(reg_id) and
`device key`(g_access_key) via `prov_dev_set_symmetric_key_info`
```
prov_dev_set_symmetric_key_info(reg_id, g_access_key);
```

`scope id` via `Prov_Device_LL_Create`
```
if ((handle = Prov_Device_LL_Create(global_prov_uri, scope_id, Prov_Device_MQTT_Protocol)) == NULL)
```

We were listening to the registration callback as shown below
```
if (Prov_Device_LL_Register_Device(handle, register_device_callback, &user_ctx, registation_status_callback, &user_ctx) != PROV_DEVICE_RESULT_OK)
```

Finally, Azure IoT DPS service returned with the registration details
```
static void register_device_callback(PROV_DEVICE_RESULT register_result, const char* iothub_uri, const char* device_id, void* user_context)
```

Using the details, we were able to concat the new `connectiong string`
```
size_t len = snprintf(NULL, 0,
                "HostName=%s;DeviceId=%s;SharedAccessKey=%s",
                iothub_uri,
                device_id,
                g_access_key);
```
