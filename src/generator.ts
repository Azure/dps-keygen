import crypto from 'crypto'

export function generateDeviceKey(deviceId: string, masterKey: string): string {
    return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
        .update(deviceId, 'utf8')
        .digest('base64');
}