import cron from 'node-cron';
import { DateTime } from 'luxon';
import isOver from './isOver.js';
import initPost from './initPost.js';
import logger from './logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let activeJobs = [];

function getMilliseconds(slotConfig) {
    const { year, month, day, hour } = slotConfig;
    let start = DateTime.now();
    let end = DateTime.local(year, month, day, hour, 0, 0); // Assumes event time is at the start of the hour
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();
    return (slotConfig.mode === 'countdown') ? ms : Math.abs(ms);
}

function determineCronPattern(ms, slotConfig) {
    logger(`[Scheduler] determineCronPattern called with ms: ${ms}, slotConfig: ${JSON.stringify(slotConfig)}`, 'DEBUG');
    const fiveMinutes = 5 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (ms <= 0 && slotConfig.mode === 'countdown') {
        logger(`[Scheduler] determineCronPattern result for ${slotConfig.message1}: null (event past for countdown)`, 'DEBUG');
        return null; // Event is past for countdown
    }

    let pattern;
    if (ms < fiveMinutes) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every minute.`, 'INFO');
        pattern = '* * * * *'; // Every minute
    } else if (ms < oneHour) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every 5 minutes.`, 'INFO');
        pattern = '*/5 * * * *'; // Every 5 minutes
    } else if (ms < twentyFourHours) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every hour at minute 0.`, 'INFO');
        pattern = `0 * * * *`; // Every hour at minute 0
    } else {
        // Default: Daily at specified postTime (hour)
        // Ensure postTime is a valid hour (0-23)
        const postHour = (slotConfig.postTime >= 0 && slotConfig.postTime <= 23) ? slotConfig.postTime : 0;
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling daily at ${postHour}:00.`, 'INFO');
        pattern = `0 ${postHour} * * *`;
    }
    logger(`[Scheduler] determineCronPattern result for ${slotConfig.message1}: ${pattern}`, 'DEBUG');
    return pattern;
}

async function performPostAction(slotConfig, globalConfig, overStatus) {
    if (slotConfig.active) {
        logger(`[Scheduler] Performing post action for slot: ${slotConfig.message1}`, 'INFO');
        try {
            await initPost({
                // Spread all slotConfig properties
                ...slotConfig,
                // Add globalConfig properties
                ...globalConfig,
                // Add over status
                over: overStatus
            });
        } catch (error) {
            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : 'No stack available.';
                logger(`[Scheduler] Error during initPost execution for slot ${slotConfig.message1}. Error: ${errorMessage}
Stack: ${errorStack}`, 'ERROR');
            } catch (loggingError) {
                console.error(`[Scheduler] CRITICAL: Failed to log error for slot ${slotConfig.message1}. Original error: ${String(error)}. Logging error: ${String(loggingError)}`);
            }
        }
    } else {
        logger(`[Scheduler] Slot ${slotConfig.message1} is inactive. Skipping post.`, 'INFO');
    }
}

export function scheduleSlot(slotConfig, globalConfig) {
    const initialMs = getMilliseconds(slotConfig);
    let over = isOver({
        hour: slotConfig.hour,
        day: slotConfig.day,
        month: slotConfig.month,
        year: slotConfig.year,
        mode: slotConfig.mode
    });

    // If it's a countdown and already over, don't schedule.
    if (slotConfig.mode === 'countdown' && over) {
        logger(`[Scheduler] Countdown slot ${slotConfig.message1} is already over. Not scheduling.`, 'INFO');
        // Perform one last post if it's just finished
        if (initialMs <= 0 && initialMs > -60000) { // Post if it just passed within the last minute
             logger(`[Scheduler] Countdown slot ${slotConfig.message1} just passed. Performing final post.`, 'INFO');
             performPostAction(slotConfig, globalConfig, true);
        }
        return;
    }

    let cronPattern = determineCronPattern(initialMs, slotConfig);

    if (!cronPattern && slotConfig.mode === 'countdown') { // Already handled above, but as a safeguard
        logger(`[Scheduler] Countdown slot ${slotConfig.message1} determined to be past, no pattern. Not scheduling.`, 'INFO');
        return;
    }
    
    // If countup
    if (slotConfig.mode === 'countup' && !cronPattern) {
        logger(`[Scheduler] Countup slot ${slotConfig.message1} has started. Defaulting to hourly posting.`, 'INFO');
        cronPattern = `0 * * * *`; 
    }


    const job = cron.schedule(cronPattern, async () => {
        const currentTime = DateTime.now().toISO();
        const currentMs = getMilliseconds(slotConfig);
        const currentOverStatus = isOver({
            hour: slotConfig.hour,
            day: slotConfig.day,
            month: slotConfig.month,
            year: slotConfig.year,
            mode: slotConfig.mode
        });

        logger(`[Scheduler] Cron job triggered for slot: ${slotConfig.message1} (Mode: ${slotConfig.mode}). Current time: ${currentTime}, currentMs: ${currentMs}, currentOverStatus: ${currentOverStatus}`, 'INFO');

        await performPostAction(slotConfig, globalConfig, currentOverStatus);

        if (currentOverStatus && slotConfig.mode === 'countdown') {
            logger(`[Scheduler] Countdown ${slotConfig.message1} is over. Stopping job.`, 'INFO');
            job.stop();
            activeJobs = activeJobs.filter(j => j !== job);
            return;
        }

        // Dynamic rescheduling
        const newCronPattern = determineCronPattern(currentMs, slotConfig);
        if (newCronPattern !== cronPattern) {
            logger(`[Scheduler] Rescheduling slot ${slotConfig.message1}. Old pattern: ${cronPattern}, New pattern: ${newCronPattern}`, 'INFO');
            job.stop();
            activeJobs = activeJobs.filter(j => j !== job);
            if (newCronPattern) { // Only reschedule if there's a valid new pattern
                 scheduleSlot(slotConfig, globalConfig); // Re-evaluate and schedule with new pattern
            } else if (slotConfig.mode === 'countdown') {
                // This means it became null, so event is over
                 logger(`[Scheduler] Countdown ${slotConfig.message1} became over during rescheduling check. Old pattern: ${cronPattern}. Final post might have occurred.`, 'INFO');
            }
        }
    }, {
        scheduled: false
    });

    activeJobs.push(job);
    job.start();
    logger(`[Scheduler] Slot ${slotConfig.message1} scheduled with pattern: ${cronPattern}. Job ID: ${job.toString()}`, 'INFO');
}

export function cancelAllJobs() {
    logger('[Scheduler] Cancelling all active cron jobs.', 'INFO');
    activeJobs.forEach(job => job.stop());
    activeJobs = [];
}

export function rescheduleAllFromConfig() {
    logger('[Scheduler] Starting to reschedule all jobs from configuration.', 'INFO');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const configPath = path.resolve(__dirname, '../config/config.json');

    try {
        // Clear the require cache for the config file
        delete require.cache[require.resolve(configPath)];
        // Re-require the config file
        const config = require(configPath);

        if (!config || !config.slots || !config.settings) {
            logger('[Scheduler] Configuration file is invalid or missing required sections (slots, settings).', 'ERROR');
            return;
        }

        const globalConfig = {
            logLevel: config.settings.logLevel || "INFO", 
            debuggingEnv: config.settings.debuggingEnv || false,
            tumblrBlogName: config.settings.tumblrBlogName || "",
            discordChannelName: config.settings.discordChannelName || ""
            // Add any other global settings from config.settings needed by scheduleSlot or performPostAction
        };

        if (!globalConfig.tumblrBlogName) {
            logger('[Scheduler] Tumblr Blog Name is not configured in settings. Some functionalities might be affected.', 'WARN');
        }
        if (!globalConfig.discordChannelName) {
            logger('[Scheduler] Discord Channel Name is not configured in settings. Some functionalities might be affected.', 'WARN');
        }

        cancelAllJobs();

        config.slots.forEach(slot => {
            if (slot) { // Basic check for null/undefined slots
                scheduleSlot(slot, globalConfig);
            } else {
                logger('[Scheduler] Encountered an invalid slot entry in configuration. Skipping.', 'WARN');
            }
        });

        logger('[Scheduler] Rescheduling all jobs complete.', 'INFO');

    } catch (error) {
        logger(`[Scheduler] Error during rescheduleAllFromConfig: ${String(error)}`, 'ERROR');
    }
}