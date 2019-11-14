import chalk from 'chalk'

export function green(msg: string) {
    console.log(chalk.green(msg));
}

export function red(msg: string) {
    console.log(chalk.red(msg));
}

export function yellow(msg: string) {
    console.log(chalk.yellow(msg));
}

export function blue(msg: string) {
    console.log(chalk.blue(msg));
}

export function log(msg: string) {
    console.log(msg);
}

export function result(msg: string, title?: string) {
    console.log(`${(title && title.length > 0) ? title : ''}${chalk.green(msg)}`);
}
export function error(msg: string) {
    red(msg);
}

export function progress(msg: string) {
    yellow(msg);
}

export function errorAlert(msg: string) {
    console.log(chalk.bgRed(msg));
}

export function warnAlert(msg: string) {
    console.log(`${chalk.bgRedBright.white('WARN')} ${chalk.bgYellow.black(msg)}`);
}
export function warnAlertString(msg: string, prefix: boolean = true): string {
    return `${prefix ? chalk.bgRedBright.white('WARN') : ''} ${chalk.bgYellow.black(msg)}`;
}