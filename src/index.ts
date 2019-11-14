#!/usr/bin/env node
import yargs from 'yargs';
import { generateDeviceKey } from './generator';
import { GenKeyOptions, CStringOptions, ConnectionType } from './interfaces';
import { result, log, blue, error, warnAlert, warnAlertString } from './cli';
import { getConnectionString } from './hub';

yargs
    .usage('Usage: $0 <command> [options]')
    .command<GenKeyOptions>('generate-device-key', 'Generate a device key from a master key', {
        key: {
            type: 'string',
            alias: 'k',
            demandOption: true,
            desc: 'Master key for the application'
        },
        deviceId: {
            type: 'string',
            alias: 'd',
            demandOption: true,
            desc: 'Device Id'
        }
    }, (args) => {
        log('Generating device key...');
        result(generateDeviceKey(args.deviceId as string, args.key as string), 'Device key: ');
    })
    .command('get-connection-string [options]', `Get IoT Hub connection string for the device [deprecated]`, (yargs) => {
        yargs.option('scopeId', {
            alias: 's',
            demandOption: true,
            type: 'string',
            desc: 'Application scope Id',
            nargs: 1
        })
            .option('deviceId', {
                alias: 'i',
                demandOption: true,
                type: 'string',
                desc: 'Device Id',
                nargs: 1
            })
            .option('deviceKey', {
                alias: 'd',
                type: 'string',
                desc: 'Device key',
                nargs: 1
            })
            .option('masterKey', {
                alias: 'm',
                type: 'string',
                desc: 'Master key',
                nargs: 1
            })
            .option('templateId', {
                alias: 't',
                type: 'string',
                desc: 'IoT Central template Id to associate device',
                nargs: 1
            })
            .usage(`${warnAlertString('This feature is deprecated and will be dismissed on Jan 31 2020')}\n\
            ${warnAlertString('IoTHub connection strings should not be used when connecting to Azure IoTCentral')}\n\
            ${warnAlertString('IoTCentral relies on Azure DPS (Device Provisioning Service) to manage connections.')}\n\
            ${warnAlertString('More details available here: https://docs.microsoft.com/en-us/azure/iot-central/core/concepts-connectivity')}\n\n\
            Get IoT Hub connection string for the device [deprecated]`)
    }, async (args: CStringOptions) => {

        let keyType = ConnectionType.MASTER_KEY;
        let key = args.masterKey as string;
        if ((args.scopeId as string).length != 11) {
            yargs.showHelpOnFail(true, 'Invalid scope id length');
            throw (null);
        }
        if (!args.deviceKey && !args.masterKey) {
            yargs.showHelpOnFail(true, 'At least device or master key must be specified');
            throw (null);
        }
        if (args.deviceKey && (args.deviceKey as string).length > 0) {
            if (args.masterKey && (args.masterKey as string).length > 0) {
                yargs.showHelpOnFail(true, 'Can\'t specify both device and master key');
                throw (null);

            }
            else {
                keyType = ConnectionType.DEVICE_KEY;
                key = args.deviceKey as string;
            }
        }
        yargs.showHelpOnFail(true);
        log('Getting connection string ...');
        try {
            result(await getConnectionString(args.scopeId as string, args.deviceId as string, keyType, key, args.templateId ? args.templateId as string : undefined));
        }
        catch (ex) {
            if (ex.name && ex.result) {
                if (ex.name === 'ArgumentError' && ex.result.errorCode == 400004) {
                    yargs.showHelpOnFail(true, `Device Id has unsupported value. Only case insensitive alphanumeric and '-', '.', '_', ':' are allowed. Last character can only be alphanumeric and '-'`);
                    throw (null);
                }
                if (ex.name === 'UnauthorizedError' && ex.result.errorCode == 400209) {
                    yargs.showHelpOnFail(true, `Device not associated`);
                    throw (null);
                }

                else {
                    yargs.showHelpOnFail(true, `${ex.name}: ${ex.message}`);
                    throw (null);
                }
            }
            throw ex;
        }

    })
    .demandCommand(1)
    .help()
    .argv