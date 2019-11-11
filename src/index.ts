import yargs from 'yargs';
import { generateDeviceKey } from './generator';
import { GenKeyOptions, CStringOptions, ConnectionType } from './interfaces';
import { result, log, blue, error } from './cli';
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
    .command<CStringOptions>('get-connection-string [options]', 'Get IoT Hub connection string for the device', {
        scopeId: {
            alias: 's',
            demandOption: true,
            type: 'string',
            desc: 'Application scope Id',
            nargs: 1
        },
        deviceId: {
            alias: 'i',
            demandOption: true,
            type: 'string',
            desc: 'Device Id',
            nargs: 1
        },
        deviceKey: {
            alias: 'd',
            type: 'string',
            desc: 'Device key',
            nargs: 1
        },
        masterKey: {
            alias: 'm',
            type: 'string',
            desc: 'Master key',
            nargs: 1
        },
        templateId: {
            alias: 't',
            type: 'string',
            desc: 'IoT Central template Id to associate device',
            nargs: 1
        }
    }, async (args) => {
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