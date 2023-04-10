import { sendTweet } from"./sendPost.js";
import { sendMastodon } from"./sendPost.js";
import { sendTumblr } from"./sendPost.js";
import { sendDiscord } from"./sendPost.js";
import messageBuilder from"./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import logger from "./logger.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
let config = require("../config/config.json");

export default async function initPost(countdownHour, countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureEnd, mode, accuracy, dayCount, pictureSlot, over) {

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && over) picture = pictureEnd;

    let message = messageBuilder(countdownHour, countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd, over);
    //console.log(picture);

    let debuggingEnv = config.debuggingEnv

    if (!debuggingEnv) {
        try {
            await sendTweet(message, picture);
            //logger("Message: " + message + "\n\nPicture : " + picture + "\n")
            player().play('./sounds/notify.mp3');

            //throw 'MyException';
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nTweet not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }

        try {
            await sendMastodon(message, picture);
            //logger("Message: " + message + "\n\nPicture : " + picture + "\n")
            player().play('./sounds/notify.mp3');

            //throw 'MyException';
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nMastodon message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }

        try {
            await sendTumblr(message, picture);
            //logger("Message: " + message + "\n\nPicture : " + picture + "\n")
            player().play('./sounds/notify.mp3');

            //throw 'MyException';
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nTumblr message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }
        

        try {
            await sendDiscord(message, picture);
            //logger("Message: " + message + "\n\nPicture : " + picture + "\n")
            player().play('./sounds/notify.mp3');

            //throw 'MyException';
        }
        catch(e) {
            logger('!!!WARNING!!!\n\nDiscord message not sent!\n\nPicture used:' + picture + '\n\nError log:')
            console.log(e);
        }
    }
    else logger("Program in debug mode. Message: " + message + " " + picture);
}
