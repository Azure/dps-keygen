import yargs = require("yargs");

export enum ConnectionType {
    DEVICE_KEY,
    MASTER_KEY
}

export interface GenKeyOptions {
    [x: string]: yargs.Options,
    key: yargs.Options,
    deviceId: yargs.Options
}

export interface CStringOptions {
    scopeId: string,
    deviceId: string,
    deviceKey: string,
    masterKey: string,
    templateId: string,

}