import fs from 'fs';
import logger from '../utils/logger.js';

const defaultConfig = {
    debuggingEnv: true,
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

export function createConfigIfNeeded(configPath) {
    // If config file doesn't exist, create it with default data
    if (!fs.existsSync(configPath)) {
        logger("Config file not found, creating a new one with default values...");
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
}