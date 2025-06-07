import { sendTweet } from "./sendPost.js";
import { sendBluesky } from "./sendPost.js";
import { sendMastodon } from "./sendPost.js";
import { sendTumblr } from "./sendPost.js";
import { sendDiscord } from "./sendPost.js";
import messageBuilder from "./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import logger from "./logger.js";
import path from 'path'

export default async function initPost(postDetails) {
    const { hour, day, month, year, mode, accuracy, dayCount, message1, message2, messageEnd, pictureEnd, pictureSlot, over, debuggingEnv, tumblrBlogName, discordChannelName } = postDetails;

    let pictureEndDir = './pictures/endings';

    let picture = null; // Initialize picture to null

    try {
        // Only attempt to refresh picture if pictureSlot is provided and is a non-empty string
        if (pictureSlot && typeof pictureSlot === 'string' && pictureSlot.trim() !== '') {
            picture = await refreshPic(pictureSlot);
        } else {
            // logger('DEBUG', `[initPost] No pictureSlot defined or is empty. Proceeding without picture refresh.`);
            picture = null;
        }
    } catch (error) {
        logger('ERROR', `[initPost] Failed to refresh picture using slot '${pictureSlot}'. Error: ${String(error)}`);
        picture = null; // Ensure picture is null if refreshPic fails
    }

    if (mode === 'countdown' && over) {
        if (pictureEnd && typeof pictureEnd === 'string' && pictureEnd.trim() !== '') {
            picture = path.join(pictureEndDir, pictureEnd);
        } else {
            // If pictureEnd is also not available, picture remains null (or its state from the try-catch, which should be null on failure)
            logger('WARN', `[initPost] Countdown over, but no pictureEnd defined or is empty. Picture will remain as is (likely null).`);
            if (picture === undefined) { // Should not happen if initialized to null, but as a safeguard
                picture = null;
            }
        }
    }

    let message = messageBuilder(hour, day, month, year, mode, accuracy, dayCount, message1, message2, messageEnd, over);

    if (!debuggingEnv) {
        
        if (!over) {logger('INFO', `Sending message: ${message}`);}
        else {logger('INFO', `Sending message: ${message}\nPicture: ${picture}\n..........`);}

        try {
            await sendTweet(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger('WARN', `Failed to play notification sound after Tweet './sounds/notify.mp3' ${String(soundError)}`);
            }
        }
        catch (e) {
            logger('WARN', `Failed to send Tweet. Picture used: ${picture}. Error: ${String(e)}`);
        }

        try {
            await sendBluesky(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger('WARN', `Failed to play notification sound after Bluesky post './sounds/notify.mp3' ${String(soundError)}`);
            }
        }
        catch(e) {
            logger('WARN', `Failed to send Bluesky post. Picture used: ${picture}. Error: ${String(e)}`);
        }

        try {
            await sendMastodon(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger('WARN', `Failed to play notification sound after Mastodon post './sounds/notify.mp3' ${String(soundError)}`);
            }
        }
        catch(e) {
            logger('WARN', `Failed to send Mastodon post. Picture used: ${picture}. Error: ${String(e)}`);
        }

        try {
            await sendTumblr(message, picture, tumblrBlogName);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger('WARN', `Failed to play notification sound after Tumblr post './sounds/notify.mp3' ${String(soundError)}`);
            }
        }
        catch(e) {
            logger('WARN', `Failed to send Tumblr post. Picture used: ${picture}. Error: ${String(e)}`);
        }
        

        try {
            await sendDiscord(message, picture, discordChannelName);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger('WARN', `Failed to play notification sound after Discord post './sounds/notify.mp3' ${String(soundError)}`);
            }
        }
        catch(e) {
            logger('WARN', `Failed to send Discord message. Picture used: ${picture}. Error: ${String(e)}`);
        }

    }
    else logger('DEBUG', `Program in debug mode. Message: ${message} ${picture}`);
    try {
        player().play('./sounds/notify.mp3');
    } catch (e) {
        logger('WARN', `Failed to play final notification sound './sounds/notify.mp3' ${String(e)}`);
    }
}
