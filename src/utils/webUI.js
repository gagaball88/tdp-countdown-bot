import logger from "./logger.js";
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { rescheduleAllFromConfig } from './scheduler.js';

let recentLogs = [];
const MAX_LOG_LINES = 200;
var clients = [];

const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url); // ES module __filename
const __dirname = path.dirname(__filename); // ES module __dirname
const configPath = path.resolve(__dirname, '../config/config.json'); // Define configPath once

export async function startServer() {
    // Serve static files from web_public first
    app.use(express.static(path.resolve('../src/web_public')));
    // Serve static pictures from top-level 'pictures' directory
    app.use('/pictures', express.static(path.resolve('pictures')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Root route serves the main HTML file
    app.get("/", (req, res) => {
        res.sendFile(path.resolve('../src/web_public/index.html'));
    });

    // API endpoint to provide initial data for the client-side script
    app.get("/api/initial-data", (req, res) => {
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger(`Error reading config file for /api/initial-data: ${configPath} ${String(err)}`, 'ERROR');
            return res.status(500).json({ message: "Error loading configuration." });
        }
        
        // Send raw log strings; client-side script will handle escaping if needed for HTML rendering
        const plainRecentLogs = recentLogs.map(log => log.replace(/<br>$/, ""));

        res.json({
            slots: currentConfig.slots,
            initialMessages: plainRecentLogs 
        });
    });
	
    // SSE ENDPOINT (remains the same)
    app.get("/events", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        clients.push(res);
        req.on("close", () => {
            clients = clients.filter((client) => client !== res);
        });
    });

    // API endpoint to get current settings
    app.get("/api/settings", (req, res) => {
        try {
            const configData = fs.readFileSync(configPath, 'utf-8');
            const currentConfig = JSON.parse(configData);
            if (currentConfig && currentConfig.settings) {
                res.json(currentConfig.settings);
            } else {
                logger(`[WebUI] /api/settings: 'settings' object not found in config.json`, 'WARN');
                res.status(404).json({ message: "Settings not found in configuration." });
            }
        } catch (err) {
            logger(`[WebUI] Error reading config file for /api/settings: ${configPath} ${String(err)}`, 'ERROR');
            res.status(500).json({ message: "Error loading settings from configuration file." });
        }
    });

    // API endpoint to save settings
    app.post("/api/settings/save", (req, res) => {
        const { debuggingEnv, tumblrBlogName, discordChannelName } = req.body;
        const errors = {};

        // Validate input types
        if (typeof debuggingEnv !== 'boolean') {
            errors.debuggingEnv = "debuggingEnv must be a boolean (true or false).";
        }
        if (typeof tumblrBlogName !== 'string') {
            errors.tumblrBlogName = "tumblrBlogName must be a string.";
        }
        if (typeof discordChannelName !== 'string') {
            errors.discordChannelName = "discordChannelName must be a string.";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Validation failed.", errors });
        }

        let currentConfig;
        try {
            const configData = fs.readFileSync(configPath, 'utf-8');
            currentConfig = JSON.parse(configData);
        } catch (err) {
            logger(`[WebUI] Error reading config file for /api/settings/save: ${configPath} ${String(err)}`, 'ERROR');
            return res.status(500).json({ message: "Error loading configuration file for saving." });
        }

        // Ensure settings object exists
        if (!currentConfig.settings) {
            currentConfig.settings = {};
        }

        // Update only the specified settings
        currentConfig.settings.debuggingEnv = debuggingEnv;
        currentConfig.settings.tumblrBlogName = tumblrBlogName;
        currentConfig.settings.discordChannelName = discordChannelName;

        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger(`[WebUI] Error writing config file for /api/settings/save: ${String(err)}`, 'ERROR');
                return res.status(500).json({ message: "Failed to save settings.", error: err.message });
            }
            res.json({ message: "Settings saved successfully." });
            // After sending response, trigger rescheduling
            logger("[WebUI] Settings changed via /api/settings/save. Triggering scheduler update.", "INFO");
            rescheduleAllFromConfig();
        });
    });

    // SLOT OPERATIONS (save, delete, add)
    app.post("/saveSlot/:index", (req, res) => {
        logger(`Received body for saveSlot: ${JSON.stringify(req.body)}`, 'DEBUG');
        const index = parseInt(req.params.index, 10);
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger(`Error reading config file for /saveSlot: ${configPath} ${String(err)}`, 'ERROR');
            return res.status(500).json({ message: "Error loading configuration for saving." });
        }

        if (isNaN(index) || index < 0 || index >= currentConfig.slots.length) {
            return res.status(400).json({ message: "Invalid slot index." });
        }

        const errors = {};
        const {
            hour: rawHour, day: rawDay, month: rawMonth, year: rawYear,
            accuracy: rawAccuracy, postTime: rawPostTime, active: rawActive, dayCount: rawDayCount,
            message1, message2, mode, messageEnd, pictureEnd, pictureSlot
        } = req.body;

        const currentYear = new Date().getFullYear();

        const hour = parseInt(rawHour, 10);
        if (isNaN(hour) || hour < 0 || hour > 23) errors.hour = "Hour must be a number between 0 and 23.";
        const day = parseInt(rawDay, 10);
        if (isNaN(day) || day < 1 || day > 31) errors.day = "Day must be a number between 1 and 31.";
        const month = parseInt(rawMonth, 10);
        if (isNaN(month) || month < 1 || month > 12) errors.month = "Month must be a number between 1 and 12.";
        const year = parseInt(rawYear, 10);
        if (isNaN(year) || year < currentYear || year > 2100) errors.year = `Year must be a number between ${currentYear} and 2100.`;
        const accuracy = parseInt(rawAccuracy, 10);
        if (isNaN(accuracy) || accuracy < 0 || accuracy > 5) errors.accuracy = "Accuracy must be a number between 0 and 5.";
        const postTimeValue = parseInt(rawPostTime, 10); // Renamed to avoid conflict
        if (isNaN(postTimeValue) || postTimeValue < 0 || postTimeValue > 23) errors.postTime = "Post Time must be a number between 0 and 23.";

        if (typeof message1 !== 'string') errors.message1 = "Message 1 must be a string.";
        // Allow message1 to be empty
        if (typeof message2 !== 'string') errors.message2 = "Message 2 must be a string.";
        // Allow message2 to be empty
        if (typeof mode !== 'string' || !['countdown', 'countup'].includes(mode.toLowerCase())) errors.mode = "Mode must be 'countdown' or 'countup'.";

        const active = String(rawActive).toLowerCase() === "true" || rawActive === true;
        const dayCount = String(rawDayCount).toLowerCase() === "true" || rawDayCount === true;

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Validation failed.", errors });
        }
        
        currentConfig.slots[index] = {
            hour, day, month, year, accuracy, postTime: postTimeValue, active, dayCount,
            message1: String(message1),
            message2: String(message2),
            mode: String(mode).toLowerCase(),
            messageEnd: messageEnd ? String(messageEnd) : "",
            pictureEnd: pictureEnd ? String(pictureEnd) : "",
            pictureSlot: pictureSlot ? String(pictureSlot) : ""
        };

        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger("Error writing config file for /saveSlot: " + String(err), 'ERROR');
                return res.status(500).json({ message: "Failed to save slot configuration.", error: err.message });
            }
            res.json({ message: "Slot saved successfully." });
            // After sending response, trigger rescheduling
            logger("[WebUI] Config changed via /saveSlot. Triggering scheduler update.", "INFO");
            rescheduleAllFromConfig();
        });
    });

    app.delete("/deleteSlot/:index", (req, res) => {
        const index = parseInt(req.params.index, 10);
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger(`Error reading config file for /deleteSlot: ${configPath} ${String(err)}`, 'ERROR');
            return res.status(500).json({ message: "Error loading configuration for deletion." });
        }

        if (isNaN(index) || index < 0 || index >= currentConfig.slots.length) {
            return res.status(400).json({ message: "Invalid slot index." });
        }
        currentConfig.slots.splice(index, 1);
        
        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger("Error writing config file for /deleteSlot: " + String(err), 'ERROR');
                return res.status(500).json({ message: "Failed to delete slot.", error: err.message });
            }
            res.json({ message: "Slot deleted successfully." });
            // After sending response, trigger rescheduling
            logger("[WebUI] Config changed via /deleteSlot. Triggering scheduler update.", "INFO");
            rescheduleAllFromConfig();
        });
    });

    app.post("/addSlot", (req, res) => {
        const newSlot = { 
            hour: 0, day: 1, month: 1, year: new Date().getFullYear(),
            message1: "New Slot Message 1", message2: "New Slot Message 2",
            messageEnd: "", pictureEnd: "", active: true, mode: "countdown",
            accuracy: 5, dayCount: true, pictureSlot: "", postTime: 0
        };
        
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger(`Error reading config file for /addSlot: ${configPath} ${String(err)}`, 'ERROR');
            return res.status(500).json({ message: "Error loading configuration for adding slot." });
        }
        
        currentConfig.slots.push(newSlot);
        
        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger("Error writing config file for /addSlot: " + String(err), 'ERROR');
                return res.status(500).json({ message: "Failed to add new slot.", error: err.message });
            }
            res.json({ // Send response to client
                message: "New slot added successfully.",
                index: currentConfig.slots.length - 1
            });
            // After sending response, trigger rescheduling
            logger("[WebUI] Config changed via /addSlot. Triggering scheduler update.", "INFO");
            rescheduleAllFromConfig(); // Call the imported function
        });
    });

    // START THE SERVER
    app.listen(PORT, () => {
        logger(`Server running on port ${PORT}`, 'INFO');
    });
}
export async function refreshData(newData) {
    recentLogs.push(newData);
    if (recentLogs.length > MAX_LOG_LINES) {
        recentLogs.shift(); 
    }
    clients.forEach((client) => {
        client.write('data: ' + newData + "\n\n");
    });
}