import logger from './utils/logger.js';
// import taskPlanner from './utils/taskPlanner.js'; // taskPlanner is now deprecated
import { scheduleSlot, cancelAllJobs } from './utils/scheduler.js';
import { startServer } from './utils/webUI.js';
import escExit from 'esc-exit';
import player from 'play-sound';
import { createConfigIfNeeded } from './config/config.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

createConfigIfNeeded('./config/config.json');

let config = require("./config/config.json");
logger("Config file loaded");

function updateVariables() {

    delete require.cache[require.resolve('./config/config.json')]   // Deleting loaded module
    config = require("./config/config.json");
    const globalConfig = {
        debuggingEnv: config.debuggingEnv,
        tumblrBlogName: config.tumblrBlogName,
        discordChannelName: config.discordChannelName
        // Add any other global settings from config here
    };

    // Cancel any existing jobs before rescheduling
    cancelAllJobs();

    for (var i = 0; i < config.slots.length; i++) {
        // Ensure we are passing the individual slot object and the global config
        scheduleSlot(config.slots[i], globalConfig);
    }

}

///Initialization

console.log("To quit, press ESC or Ctrl-C\n\n");
logger("Bot started successfully\n");
try {
    player().play('./sounds/start.mp3');
} catch (e) {
    logger.error("Failed to play startup sound './sounds/start.mp3'", e);
}
startServer();


escExit();

let uptime = 0;

updateVariables()

///Uptime message

setInterval(() => {
    uptime = uptime + 12;
    logger("Everything's working fine for " + uptime + " hours now :)");
}, 12 * 60 * 60 * 1000)

// setInterval(() => {
//     updateVariables()
// }, 60 * 1000) // This interval is removed as per requirements