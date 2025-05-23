import logger from "./logger.js";
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path'; // Added path import

// escapeHtml can be removed if not used anywhere else on server-side
// function escapeHtml(unsafe) { ... } 

let recentLogs = [];
const MAX_LOG_LINES = 200;
var clients = [];

const app = express();
const PORT = 8080;
const configPath = './config/config.json'; // Define configPath once

export async function startServer() {
    // Serve static files from web_public first
    app.use(express.static(path.resolve('src/web_public')));
    // Serve static pictures from top-level 'pictures' directory
    app.use('/pictures', express.static(path.resolve('pictures')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Root route serves the main HTML file
    app.get("/", (req, res) => {
        res.sendFile(path.resolve('src/web_public/index.html'));
    });

    // API endpoint to provide initial data for the client-side script
    app.get("/api/initial-data", (req, res) => {
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger.error(`Error reading config file for /api/initial-data: ${configPath}`, err);
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

    // SLOT OPERATIONS (save, delete, add)
    // These now load config on each request to ensure they have the latest data
    // and don't rely on a potentially stale 'config' variable from startServer scope.

    app.post("/saveSlot/:index", (req, res) => {
        const index = parseInt(req.params.index, 10);
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger.error(`Error reading config file for /saveSlot: ${configPath}`, err);
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

        if (typeof message1 !== 'string' || message1.trim() === "") errors.message1 = "Message 1 is required.";
        if (typeof message2 !== 'string' || message2.trim() === "") errors.message2 = "Message 2 is required.";
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
                logger.error("Error writing config file for /saveSlot:", err);
                return res.status(500).json({ message: "Failed to save slot configuration.", error: err.message });
            }
            res.json({ message: "Slot saved successfully." });
        });
    });

    app.delete("/deleteSlot/:index", (req, res) => {
        const index = parseInt(req.params.index, 10);
        let currentConfig;
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (err) {
            logger.error(`Error reading config file for /deleteSlot: ${configPath}`, err);
            return res.status(500).json({ message: "Error loading configuration for deletion." });
        }

        if (isNaN(index) || index < 0 || index >= currentConfig.slots.length) {
            return res.status(400).json({ message: "Invalid slot index." });
        }
        currentConfig.slots.splice(index, 1);
        
        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger.error("Error writing config file for /deleteSlot:", err);
                return res.status(500).json({ message: "Failed to delete slot.", error: err.message });
            }
            res.json({ message: "Slot deleted successfully." });
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
            logger.error(`Error reading config file for /addSlot: ${configPath}`, err);
            return res.status(500).json({ message: "Error loading configuration for adding slot." });
        }
        
        currentConfig.slots.push(newSlot);
        
        fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), (err) => {
            if (err) {
                logger.error("Error writing config file for /addSlot:", err);
                return res.status(500).json({ message: "Failed to add new slot.", error: err.message });
            }
            res.json({
                message: "New slot added successfully.",
                index: currentConfig.slots.length - 1
            });
        });
    });

    // START THE SERVER
    app.listen(PORT, () => {
        logger(`Server running on port ${PORT}`);
    });
}

// refreshData remains the same as it's for SSE updates
export async function refreshData(newData) {
    recentLogs.push(newData);
    if (recentLogs.length > MAX_LOG_LINES) {
        recentLogs.shift(); 
    }
    clients.forEach((client) => {
        client.write('data: ' + newData + "\n\n");
    });
}