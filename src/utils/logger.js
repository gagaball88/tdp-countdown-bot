import { refreshData as refreshWebUIData } from './webUI.js';
import config from '../config/config.js'; // Import config

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR']; // Updated LOG_LEVELS array
const LOG_LEVELS_HIERARCHY = {'DEBUG': 0, 'INFO': 1, 'WARN': 2, 'ERROR': 3};

// Determine current log level from config or default to INFO
let currentLogLevel = 'INFO';
if (config && config.LOG_LEVEL && LOG_LEVELS_HIERARCHY.hasOwnProperty(config.LOG_LEVEL.toUpperCase())) {
    currentLogLevel = config.LOG_LEVEL.toUpperCase();
} else if (config && config.LOG_LEVEL) {
    console.log(`Invalid LOG_LEVEL: ${config.LOG_LEVEL}. Defaulting to INFO.`);
}

const currentLogLevelNumeric = LOG_LEVELS_HIERARCHY[currentLogLevel];

export default function logger(...args) {
    let messageLevel = 'INFO'; // Default level for messages
    const messageParts = [];

    args.forEach(arg => {
        if (typeof arg === 'string' && LOG_LEVELS.includes(arg.toUpperCase())) {
            messageLevel = arg.toUpperCase();
        } else if (typeof arg === 'object' && arg !== null) {
            messageParts.push(JSON.stringify(arg));
        } else {
            messageParts.push(arg);
        }
    });

    const message = messageParts.join(' ');
    const messageLogLevelNumeric = LOG_LEVELS_HIERARCHY[messageLevel];

    // If the message's numerical level is less than the currentLogLevel's numerical level, do not print the log.
    if (messageLogLevelNumeric < currentLogLevelNumeric) {
        return;
    }

    const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();

    let timestamp = `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const logString = `${timestamp} - ${messageLevel}: ${message}`; // Use messageLevel here

    console.log("\r" + logString + "\n");
    try {
        refreshWebUIData(logString);
    } catch (webUiError) {
        console.error("Error refreshing Web UI data:", webUiError);
    }
}