import logger from './utils/logger.js';
// import taskPlanner from './utils/taskPlanner.js'; // taskPlanner is now deprecated
import { rescheduleAllFromConfig } from './utils/scheduler.js'; // Changed import
import { startServer } from './utils/webUI.js';
import escExit from 'esc-exit';
import player from 'play-sound';
import { createConfigIfNeeded } from './config/config.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url); // This might be removable if not used elsewhere

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    try {
        const reasonMessage = reason instanceof Error ? reason.message : String(reason);
        const reasonStack = reason instanceof Error ? reason.stack : 'No stack available.';
        logger('ERROR', `[GLOBAL_HANDLER] Unhandled Rejection at: Promise, Reason: ${reasonMessage}\nStack: ${reasonStack}`);
    } catch (loggingError) {
        console.error(`[GLOBAL_HANDLER] CRITICAL: Failed to log Unhandled Rejection. Original reason: ${String(reason)}. Logging error: ${String(loggingError)}`);
    }
});

process.on('uncaughtException', (error) => {
    try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack available.';
        logger('ERROR', `[GLOBAL_HANDLER] Uncaught Exception: ${errorMessage}\nStack: ${errorStack}`);
    } catch (loggingError) {
        console.error(`[GLOBAL_HANDLER] CRITICAL: Failed to log Uncaught Exception. Original error: ${String(error)}. Logging error: ${String(loggingError)}`);
    }
    logger('ERROR', '[GLOBAL_HANDLER] Uncaught exception detected. Application will now exit.');
    process.exit(1);
});

createConfigIfNeeded('./config/config.json');

///Initialization
console.log("To quit, press ESC or Ctrl-C\n\n");
logger('INFO', "Bot started successfully\n");
try {
    player().play('./sounds/start.mp3');
} catch (e) {
    logger('ERROR', `Failed to play startup sound './sounds/start.mp3' ${String(e)}`);
}
startServer();


escExit();

let uptime = 0;

rescheduleAllFromConfig(); // Replaced call to updateVariables

///Uptime message
setInterval(() => {
    uptime = uptime + 12;
    logger('DEBUG', `Everything's working fine for ${uptime} hours now :)`);
}, 12 * 60 * 60 * 1000)