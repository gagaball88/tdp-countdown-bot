import fs from 'fs';
import logger from '../utils/logger.js'; // This import might be problematic due to circular dependency

const configPath = './config.json'; // Define a path for the config file

const defaultConfig = {
    LOG_LEVEL: 'INFO', // Added LOG_LEVEL
    debuggingEnv: true,
    tumblrBlogName: "countdowntdp",
    discordChannelName: "tdp-countdown-bot",
    slots: [
        {
            hour: 9,
            day: 1,
            month: 1,
            year: 2025,
            message1: "Default Message 1",
            message2: "Default Message 2",
            messageEnd: "",
            pictureEnd: "",
            active: true,
            mode: "countdown",
            accuracy: 5,
            dayCount: true,
            pictureSlot: "",
            postTime: 0
        }
    ]
};

export function createConfigIfNeeded(path = configPath) { // path parameter defaults to configPath
    // If config file doesn't exist, create it with default data
    if (!fs.existsSync(path)) {
        // Note: logger might not be fully initialized here if called during initial module load by logger.js
        // However, createConfigIfNeeded is typically called explicitly after setup.
        logger("Config file not found, creating a new one with default values...", 'INFO');
        fs.writeFileSync(path, JSON.stringify(defaultConfig, null, 2));
    }
}

let config;

try {
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configFile);
    } else {
        config = { ...defaultConfig }; // Use a copy of defaultConfig
        // Optionally, create the file if it doesn't exist, though createConfigIfNeeded also does this
        // fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
} catch (error) {
    // Use console.error here as logger might not be available or could cause loop
    console.error("Error loading config file, using default config:", error);
    config = { ...defaultConfig }; // Use a copy
}

// Ensure all default keys are present in the loaded config
for (const key in defaultConfig) {
    if (config[key] === undefined) {
        config[key] = defaultConfig[key];
    }
}

export default config; // Export the loaded (or default) configuration object