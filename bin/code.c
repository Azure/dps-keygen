// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.


// hint on compile; copy the source code here and paste onto ->
// azure-iot-sdk-c/provisioning_client/samples/prov_dev_client_ll_sample/prov_dev_client_ll_sample.c
// compile the whole SDK with provisioning enabled

#include <stdio.h>
#include <stdlib.h>

#include "iothub.h"
#include "iothub_message.h"
#include "iothub_client_version.h"
#include "azure_c_shared_utility/threadapi.h"
#include "azure_c_shared_utility/tickcounter.h"
#include "azure_c_shared_utility/shared_util_options.h"
#include "azure_c_shared_utility/http_proxy_io.h"

#include "iothub_device_client_ll.h"
#include "iothub_client_options.h"
#include "azure_prov_client/prov_device_ll_client.h"
#include "azure_prov_client/prov_security_factory.h"

#include "iothubtransportmqtt.h"
#include "azure_prov_client/prov_transport_mqtt_client.h"


DEFINE_ENUM_STRINGS(PROV_DEVICE_RESULT, PROV_DEVICE_RESULT_VALUE);
DEFINE_ENUM_STRINGS(PROV_DEVICE_REG_STATUS, PROV_DEVICE_REG_STATUS_VALUES);

static const char* global_prov_uri = "global.azure-devices-provisioning.net";
static char* g_access_key = NULL;

static bool g_use_proxy = false;
static const char* PROXY_ADDRESS = "127.0.0.1";

#define PROXY_PORT                  8888
#define MESSAGES_TO_SEND            2
#define TIME_BETWEEN_MESSAGES       2

typedef struct CLIENT_SAMPLE_INFO_TAG
{
    unsigned int sleep_time;
    char* iothub_uri;
    char* access_key_name;
    char* device_key;
    char* device_id;
    int registration_complete;
} CLIENT_SAMPLE_INFO;

typedef struct IOTHUB_CLIENT_SAMPLE_INFO_TAG
{
    int connected;
    int stop_running;
} IOTHUB_CLIENT_SAMPLE_INFO;

static IOTHUBMESSAGE_DISPOSITION_RESULT receive_msg_callback(IOTHUB_MESSAGE_HANDLE message, void* user_context)
{
    (void)message;
    IOTHUB_CLIENT_SAMPLE_INFO* iothub_info = (IOTHUB_CLIENT_SAMPLE_INFO*)user_context;
    (void)printf("Stop message recieved from IoTHub\r\n");
    iothub_info->stop_running = 1;
    return IOTHUBMESSAGE_ACCEPTED;
}

static void registation_status_callback(PROV_DEVICE_REG_STATUS reg_status, void* user_context)
{
    (void)user_context;
    (void)printf(".");
}

static void iothub_connection_status(IOTHUB_CLIENT_CONNECTION_STATUS result, IOTHUB_CLIENT_CONNECTION_STATUS_REASON reason, void* user_context)
{
    (void)reason;
    if (user_context == NULL)
    {
        printf("iothub_connection_status user_context is NULL\r\n");
    }
    else
    {
        IOTHUB_CLIENT_SAMPLE_INFO* iothub_info = (IOTHUB_CLIENT_SAMPLE_INFO*)user_context;
        if (result == IOTHUB_CLIENT_CONNECTION_AUTHENTICATED)
        {
            iothub_info->connected = 1;
        }
        else
        {
            iothub_info->connected = 0;
            iothub_info->stop_running = 1;
        }
    }
}

static void register_device_callback(PROV_DEVICE_RESULT register_result, const char* iothub_uri, const char* device_id, void* user_context)
{
    if (user_context == NULL)
    {
        printf("user_context is NULL\r\n");
    }
    else
    {
        CLIENT_SAMPLE_INFO* user_ctx = (CLIENT_SAMPLE_INFO*)user_context;
        if (register_result == PROV_DEVICE_RESULT_OK)
        {
            (void)printf("\nRegistration Information received from service: %s!\r\n", iothub_uri);
            (void)mallocAndStrcpy_s(&user_ctx->iothub_uri, iothub_uri);
            (void)mallocAndStrcpy_s(&user_ctx->device_id, device_id);
            user_ctx->registration_complete = 1;

            size_t len = snprintf(NULL, 0,
                "HostName=%s;DeviceId=%s;SharedAccessKey=%s",
                iothub_uri,
                device_id,
                g_access_key);
            char* conn_str = (char*) malloc(len + 1);
            if (conn_str == NULL) {
                printf("OOM while creating connection string\n");
                exit(1);
            }

            snprintf(conn_str, len,
                "HostName=%s;DeviceId=%s;SharedAccessKey=%s",
                iothub_uri,
                device_id,
                g_access_key);
            conn_str[len] = 0;
            printf("Connection String:\n%s=\n", conn_str);
        }
        else
        {
            (void)printf("Failure encountered on registration %s\r\n", ENUM_TO_STRING(PROV_DEVICE_RESULT, register_result) );
            user_ctx->registration_complete = 2;
        }
    }
}

int main(int argc, char* argv[])
{
    if (argc < 4) {
        printf("usage:\ndps_csgen <scope_id> <device_id> <primary_key (groupSAS)>\n");
        return 0;
    }

    const char* scope_id = argv[1];
    const char* reg_id = argv[2];
    g_access_key = argv[3];
    prov_dev_set_symmetric_key_info(reg_id, g_access_key);

    bool traceOn = false;

    (void)IoTHub_Init();
    (void)prov_dev_security_init(SECURE_DEVICE_TYPE_SYMMETRIC_KEY);
    HTTP_PROXY_OPTIONS http_proxy;
    CLIENT_SAMPLE_INFO user_ctx;

    memset(&http_proxy, 0, sizeof(HTTP_PROXY_OPTIONS));
    memset(&user_ctx, 0, sizeof(CLIENT_SAMPLE_INFO));

    user_ctx.registration_complete = 0;
    user_ctx.sleep_time = 10;

    if (g_use_proxy)
    {
        http_proxy.host_address = PROXY_ADDRESS;
        http_proxy.port = PROXY_PORT;
    }

    PROV_DEVICE_LL_HANDLE handle;
    if ((handle = Prov_Device_LL_Create(global_prov_uri, scope_id, Prov_Device_MQTT_Protocol)) == NULL)
    {
        (void)printf("failed calling Prov_Device_LL_Create\r\n");
    }
    else
    {
        if (http_proxy.host_address != NULL)
        {
            Prov_Device_LL_SetOption(handle, OPTION_HTTP_PROXY, &http_proxy);
        }

        Prov_Device_LL_SetOption(handle, PROV_OPTION_LOG_TRACE, &traceOn);
        if (Prov_Device_LL_Register_Device(handle, register_device_callback, &user_ctx, registation_status_callback, &user_ctx) != PROV_DEVICE_RESULT_OK)
        {
            (void)printf("failed calling Prov_Device_LL_Register_Device\r\n");
        }
        else
        {
            do
            {
                Prov_Device_LL_DoWork(handle);
                ThreadAPI_Sleep(user_ctx.sleep_time);
            } while (user_ctx.registration_complete == 0);
        }
        Prov_Device_LL_Destroy(handle);
    }

    if (user_ctx.registration_complete != 1)
    {
        (void)printf("error: registration failed!\r\n");
    }
    else
    {
        IOTHUB_CLIENT_TRANSPORT_PROVIDER iothub_transport;
        iothub_transport = MQTT_Protocol;
        IOTHUB_DEVICE_CLIENT_LL_HANDLE device_ll_handle;

        if ((device_ll_handle = IoTHubDeviceClient_LL_CreateFromDeviceAuth(user_ctx.iothub_uri, user_ctx.device_id, iothub_transport) ) == NULL)
        {
            (void)printf("failed create IoTHub client from connection string %s!\r\n", user_ctx.iothub_uri);
        }
        else
        {
            IOTHUB_CLIENT_SAMPLE_INFO iothub_info;
            iothub_info.stop_running = 0;
            iothub_info.connected = 0;

            (void)IoTHubDeviceClient_LL_SetConnectionStatusCallback(device_ll_handle, iothub_connection_status, &iothub_info);
            IoTHubDeviceClient_LL_Destroy(device_ll_handle);
        }
    }
    free(user_ctx.iothub_uri);
    free(user_ctx.device_id);
    prov_dev_security_deinit();

    IoTHub_Deinit();
    return 0;
}