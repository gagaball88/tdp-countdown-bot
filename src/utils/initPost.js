import { sendTweet } from"./sendPost.js";
import { sendMastodon } from"./sendPost.js";
import { sendTumblr } from"./sendPost.js";
import messageBuilder from"./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import logger from "./logger.js";

export default async function initPost(countdownHour, countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureEnd, mode, accuracy, dayCount, pictureSlot, over) {

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && over) picture = pictureEnd;

    let message = messageBuilder(countdownHour, countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd, over);
    //console.log(picture);

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
}
