import cron from 'node-cron';
import { DateTime } from 'luxon';
import isOver from './isOver.js';
import initPost from './initPost.js'; // Assuming initPost is correctly refactored to take all details
import logger from './logger.js';
import player from 'play-sound'; // For notifications, if any are kept in this part

let activeJobs = [];

// Helper function (moved from taskPlanner.js)
function getMilliseconds(slotConfig) {
    const { year, month, day, hour } = slotConfig;
    let start = DateTime.now();
    let end = DateTime.local(year, month, day, hour, 0, 0); // Assumes event time is at the start of the hour
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();
    // If mode is 'countup', we want the difference from the past event to now.
    // If it's 'countdown', we want the difference from now to the future event.
    // The current diff logic gives a negative number if 'end' is in the past.
    // For 'countup', we need to make this positive as we're counting *from* that past point.
    // However, for determining "time until next post" for scheduling, we always look forward for countdowns.
    // For countups, they effectively post "every so often" once started.
    // This function is primarily for 'countdown' scheduling logic.
    return (slotConfig.mode === 'countdown') ? ms : Math.abs(ms);
}

function determineCronPattern(ms, slotConfig) {
    const fiveMinutes = 5 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (ms <= 0 && slotConfig.mode === 'countdown') return null; // Event is past for countdown

    if (ms < fiveMinutes) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every minute.`, 'INFO');
        return '* * * * *'; // Every minute
    } else if (ms < oneHour) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every 5 minutes.`, 'INFO');
        return '*/5 * * * *'; // Every 5 minutes
    } else if (ms < twentyFourHours) {
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling every hour at minute 0.`, 'INFO');
        return `0 * * * *`; // Every hour at minute 0
    } else {
        // Default: Daily at specified postTime (hour)
        // Ensure postTime is a valid hour (0-23)
        const postHour = (slotConfig.postTime >= 0 && slotConfig.postTime <= 23) ? slotConfig.postTime : 0;
        logger(`[Scheduler] Slot for ${slotConfig.message1} (mode: ${slotConfig.mode}): Scheduling daily at ${postHour}:00.`, 'INFO');
        return `0 ${postHour} * * *`;
    }
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
            logger(`[Scheduler] Error during initPost execution for slot ${slotConfig.message1}: ${String(error)}`, 'ERROR');
        }
    } else {
        logger(`[Scheduler] Slot ${slotConfig.message1} is inactive. Skipping post.`, 'INFO');
        // player().play('./sounds/notify.mp3'); // Or handle via logger/other notification
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
    
    // For countup, if it's "over" (meaning the start time is past), it should be active.
    // The cron pattern will handle periodic posting.

    let cronPattern = determineCronPattern(initialMs, slotConfig);

    if (!cronPattern && slotConfig.mode === 'countdown') { // Already handled above, but as a safeguard
        logger(`[Scheduler] Countdown slot ${slotConfig.message1} determined to be past, no pattern. Not scheduling.`, 'INFO');
        return;
    }
    
    // If countup and no specific pattern (e.g. way in future, which getMilliseconds might return large positive)
    // default to daily or hourly based on how far 'initialMs' is (which would be time since event start)
    if (slotConfig.mode === 'countup' && !cronPattern) {
         // Default for countup if not fitting other patterns (e.g. if getMilliseconds was negative)
         // This means the event has started. Let's assume hourly for countup as a default if not specified.
        logger(`[Scheduler] Countup slot ${slotConfig.message1} has started. Defaulting to hourly posting.`, 'INFO');
        cronPattern = `0 * * * *`; 
    }


    const job = cron.schedule(cronPattern, async () => {
        logger(`[Scheduler] Cron job triggered for slot: ${slotConfig.message1} (Mode: ${slotConfig.mode})`, 'INFO');
        const currentMs = getMilliseconds(slotConfig);
        const currentOverStatus = isOver({
            hour: slotConfig.hour,
            day: slotConfig.day,
            month: slotConfig.month,
            year: slotConfig.year,
            mode: slotConfig.mode
        });

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
            logger(`[Scheduler] Rescheduling slot ${slotConfig.message1} to pattern: ${newCronPattern}`, 'INFO');
            job.stop();
            activeJobs = activeJobs.filter(j => j !== job);
            if (newCronPattern) { // Only reschedule if there's a valid new pattern
                 scheduleSlot(slotConfig, globalConfig); // Re-evaluate and schedule with new pattern
            } else if (slotConfig.mode === 'countdown') {
                // This means it became null, so event is over
                 logger(`[Scheduler] Countdown ${slotConfig.message1} became over during rescheduling check. Final post might have occurred.`, 'INFO');
            }
        }
    }, {
        scheduled: false // Don't start immediately, we'll call .start()
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

// Example of how logger.error might be used for sound, if desired, though initPost handles its own.
// process.on('unhandledRejection', error => {
//     logger.error('Unhandled Rejection:', error);
//     player().play('./sounds/error.mp3'); // General error sound
// });
