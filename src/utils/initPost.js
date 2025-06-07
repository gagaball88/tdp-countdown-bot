import { sendTweet } from "./sendPost.js";
import { sendBluesky } from "./sendPost.js";
import { sendMastodon } from "./sendPost.js";
import { sendTumblr } from "./sendPost.js";
import { sendDiscord } from "./sendPost.js";
import messageBuilder from "./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import logger from "./logger.js";
import { createRequire } from "module";
import path from 'path'
const require = createRequire(import.meta.url);

export default async function initPost(postDetails) {
    const { hour, day, month, year, mode, accuracy, dayCount, message1, message2, messageEnd, pictureEnd, pictureSlot, over, debuggingEnv, tumblrBlogName, discordChannelName } = postDetails;

    let pictureEndDir = './pictures/endings';

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && over) picture = path.join(pictureEndDir, pictureEnd);

    let message = messageBuilder(hour, day, month, year, mode, accuracy, dayCount, message1, message2, messageEnd, over);

    if (!debuggingEnv) {
        
        if (!over) {logger('Sending message: ' + message, 'INFO');}
        else {logger('Sending message: ' + message + '\nPicture: ' + picture + '\n..........', 'INFO');}

        try {
            await sendTweet(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger("Failed to play notification sound after Tweet './sounds/notify.mp3' " + String(soundError), 'ERROR');
            }
        }
        catch (e) {
            logger('!!!WARNING!!!\n\nTweet not sent!\n\nPicture used:' + picture + '\n\nError log:', 'INFO')
            logger(String(e), 'INFO');
        }

        try {
            await sendBluesky(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger("Failed to play notification sound after Bluesky post './sounds/notify.mp3' " + String(soundError), 'ERROR');
            }
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nBluesky Post not sent!\n\nPicture used:' + picture + '\n\nError log:', 'INFO')
            logger(String(e), 'INFO');
        }

        try {
            await sendMastodon(message, picture);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger("Failed to play notification sound after Mastodon post './sounds/notify.mp3' " + String(soundError), 'ERROR');
            }
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nMastodon message not sent!\n\nPicture used:' + picture + '\n\nError log:', 'INFO')
            logger(String(e), 'INFO');
        }

        try {
            await sendTumblr(message, picture, tumblrBlogName);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger("Failed to play notification sound after Tumblr post './sounds/notify.mp3' " + String(soundError), 'ERROR');
            }
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nTumblr message not sent!\n\nPicture used:' + picture + '\n\nError log:', 'INFO')
            logger(String(e), 'INFO');
        }
        

        try {
            await sendDiscord(message, picture, discordChannelName);
            try {
                player().play('./sounds/notify.mp3');
            } catch (soundError) {
                logger("Failed to play notification sound after Discord post './sounds/notify.mp3' " + String(soundError), 'ERROR');
            }
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nDiscord message not sent!\n\nPicture used:' + picture + '\n\nError log:', 'INFO')
            logger(String(e), 'INFO');
        }

    }
    else logger("Program in debug mode. Message: " + message + " " + picture, 'INFO');
    try {
        player().play('./sounds/notify.mp3');
    } catch (e) {
        logger("Failed to play final notification sound './sounds/notify.mp3' " + String(e), 'ERROR');
    }
}
