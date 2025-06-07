import logger from './utils/logger.js';
// import taskPlanner from './utils/taskPlanner.js'; // taskPlanner is now deprecated
import { rescheduleAllFromConfig } from './utils/scheduler.js'; // Changed import
import { startServer } from './utils/webUI.js';
import escExit from 'esc-exit';
import player from 'play-sound';
import { createConfigIfNeeded } from './config/config.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url); // This might be removable if not used elsewhere

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
logger("Bot started successfully\n", 'INFO');
try {
    player().play('./sounds/start.mp3');
} catch (e) {
    logger("Failed to play startup sound './sounds/start.mp3' " + String(e), 'ERROR');
}
startServer();


escExit();

let uptime = 0;

rescheduleAllFromConfig(); // Replaced call to updateVariables

///Uptime message

setInterval(() => {
    uptime = uptime + 12;
    logger("Everything's working fine for " + uptime + " hours now :)", 'INFO');
}, 12 * 60 * 60 * 1000)

// setInterval(() => {
//     updateVariables()
// }, 60 * 1000) // This interval is removed as per requirements