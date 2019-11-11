import yargs from 'yargs';
yargs
    .command('get', 'make a get HTTP request', {
        url: {
            alias: 'u',
            default: 'http://yargs.js.org/'
        }
    })
    .help()
    .argv