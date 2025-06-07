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
        // It's hard to serialize a Promise reliably, so we'll focus on the reason.
        logger('ERROR', `[GLOBAL_HANDLER] Unhandled Rejection at: Promise, Reason: ${reasonMessage}\nStack: ${reasonStack}`);
    } catch (loggingError) {
        console.error(`[GLOBAL_HANDLER] CRITICAL: Failed to log Unhandled Rejection. Original reason: ${String(reason)}. Logging error: ${String(loggingError)}`);
    }
    // Consider whether to exit or not. For now, just log.
    // process.exit(1); // Optional: exit application
});

process.on('uncaughtException', (error) => {
    try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack available.';
        logger('ERROR', `[GLOBAL_HANDLER] Uncaught Exception: ${errorMessage}\nStack: ${errorStack}`);
    } catch (loggingError) {
        console.error(`[GLOBAL_HANDLER] CRITICAL: Failed to log Uncaught Exception. Original error: ${String(error)}. Logging error: ${String(loggingError)}`);
    }
    // It's generally recommended to exit after an uncaught exception,
    // as the application might be in an inconsistent state.
    logger('ERROR', '[GLOBAL_HANDLER] Uncaught exception detected. Application will now exit.');
    process.exit(1);
});

createConfigIfNeeded('./config/config.json');

// let config = require("./config/config.json"); // Removed as config is loaded by rescheduleAllFromConfig
// logger("Config file loaded", 'INFO'); // Removed

// function updateVariables() { // Removed function
//
//     delete require.cache[require.resolve('./config/config.json')]   // Deleting loaded module
//     config = require("./config/config.json");
//     const globalConfig = {
//         debuggingEnv: config.debuggingEnv,
//         tumblrBlogName: config.tumblrBlogName,
//         discordChannelName: config.discordChannelName
//         // Add any other global settings from config here
//     };
//
//     // Cancel any existing jobs before rescheduling
//     cancelAllJobs();
//
//     for (var i = 0; i < config.slots.length; i++) {
//         // Ensure we are passing the individual slot object and the global config
//         scheduleSlot(config.slots[i], globalConfig);
//     }
//
// }

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

// setInterval(() => {
//     updateVariables()
// }, 60 * 1000) // This interval is removed as per requirements