import { ConnectionType } from "./interfaces";
import { generateDeviceKey } from "./generator";
import { ProvisioningDeviceClient, RegistrationResult } from 'azure-iot-provisioning-device'
import { Mqtt as ProvisioningTransport } from 'azure-iot-provisioning-device-mqtt'
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key'
import { promisify } from 'util'
import { RegistrationClient } from "azure-iot-provisioning-device/lib/interfaces";
import { progress, blue } from "./cli";

const DPS_ENDPOINT = 'global.azure-devices-provisioning.net';
const REGISTRATION_TIMEOUT = 7200000;

export async function getConnectionString(scopeId: string, deviceId: string, connectionType: ConnectionType, key: string, templateId?: string): Promise<string> {
    let deviceKey: string;

    if (connectionType == ConnectionType.MASTER_KEY) {
        deviceKey = generateDeviceKey(deviceId, key);
    }
    else {
        deviceKey = key;
    }
    const provisioningClient = ProvisioningDeviceClient.create(DPS_ENDPOINT, scopeId, new ProvisioningTransport(), new SymmetricKeySecurityClient(deviceId, deviceKey));
    if (templateId && templateId.length > 0) {
        let payload: any = {
            iotcModelId: templateId
        };
        if (templateId.match(/^urn:[\S]+:[\S]+:[\d]+$/)) {
            payload = {
                '__iot:interfaces': {
                    CapabilityModelId: templateId,
                    CapabilityModel: {}
                }
            };
        }
        provisioningClient.setProvisioningPayload(payload);
    }
    const res = await assignWithRetry(provisioningClient);
    if (res.status == 'assigned' && res.assignedHub) {
        return `HostName=${res.assignedHub};DeviceId=${res.deviceId};SharedAccessKey=${deviceKey}`
    }
    else {
        throw res.status
    }
}

async function assignWithRetry(provisioningClient: RegistrationClient): Promise<RegistrationResult> {
    let startTime = Date.now();
    let firstAttempt = true;
    return new Promise<RegistrationResult>(async (resolve, reject) => {
        const register = async () => {
            if ((Date.now() - startTime) > REGISTRATION_TIMEOUT) {
                // TODO: return for timeout
                reject();
            }
            try {
                let res = await promisify(provisioningClient.register.bind(provisioningClient))() as RegistrationResult;
                if (!firstAttempt) {
                    blue('Device has been approved!');
                }
                resolve(res);
            }
            catch (e) {
                if (e.name && e.result && e.result.registrationState) {
                    if (e.name == 'ProvisioningRegistrationFailedError' && e.result.status === 'failed' && e.result.registrationState.errorCode == 400209) {
                        if (firstAttempt) {
                            blue('Device needs to be approved by application admin. We\'ll wait for up to two hours...');
                            firstAttempt = false;
                        }
                        progress('Waiting for approval...')
                        setTimeout(register, 30000);
                    }
                }
                else {
                    reject(e);
                }
            }
        }
        return register();
    })

}
