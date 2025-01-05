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
let config = require("../config/config.json");

export default async function initPost(countdownHour, countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureEnd, mode, accuracy, dayCount, pictureSlot, over) {

    let pictureEndDir = './pictures/endings';

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && over) picture = path.join(pictureEndDir, pictureEnd);

    let message = messageBuilder(countdownHour, countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd, over);

    let debuggingEnv = config.debuggingEnv

    if (!debuggingEnv) {

        logger('Sending message: ' + message + '\nPicture: ' + picture + '\n..........')

        try {
            await sendTweet(message, picture);
            player().play('./sounds/notify.mp3');

        }
        catch (e) {
            logger('!!!WARNING!!!\n\nTweet not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }

        /*try {
            await sendBluesky(message, picture);
            player().play('./sounds/notify.mp3');

        }
        catch(e) {
            logger('!!!WARNING!!!\n\nBluesky Post not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }

        try {
            await sendMastodon(message, picture);
            player().play('./sounds/notify.mp3');

        }
        catch(e) {
            logger('!!!WARNING!!!\n\nMastodon message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }

        try {
            await sendTumblr(message, picture);
            player().play('./sounds/notify.mp3');

        }
        catch(e) {
            logger('!!!WARNING!!!\n\nTumblr message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }
        

        try {
            await sendDiscord(message, picture);
            player().play('./sounds/notify.mp3');

        }
        catch(e) {
            logger('!!!WARNING!!!\n\nDiscord message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }*/

    }
    else logger("Program in debug mode. Message: " + message + " " + picture);
    player().play('./sounds/notify.mp3');
}
