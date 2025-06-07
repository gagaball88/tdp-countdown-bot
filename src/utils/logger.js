import { refreshData as refreshWebUIData } from './webUI.js';

const LOG_LEVELS = ['INFO', 'ERROR', 'WARN', 'DEBUG'];

export default function logger(...args) {
    let level = 'INFO';
    const messageParts = [];

    args.forEach(arg => {
        if (typeof arg === 'string' && LOG_LEVELS.includes(arg.toUpperCase())) {
            level = arg.toUpperCase();
        } else if (typeof arg === 'object' && arg !== null) {
            messageParts.push(JSON.stringify(arg));
        } else {
            messageParts.push(arg);
        }
    });

    const message = messageParts.join(' ');

    const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();

    let timestamp = `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const logString = `${timestamp} - ${level}: ${message}`;

    console.log("\r" + logString + "\n");
    try {
        refreshWebUIData(logString);
    } catch (webUiError) {
        console.error("Error refreshing Web UI data:", webUiError);
    }

}