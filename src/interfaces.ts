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
    [x: string]: yargs.Options,
    scopeId: yargs.Options,
    deviceId: yargs.Options,
    deviceKey: yargs.Options,
    masterKey: yargs.Options,
    templateId: yargs.Options,

}