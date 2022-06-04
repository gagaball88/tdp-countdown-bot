import sendTweet from"./sendTweet.js";
import messageBuilder from"./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import isOver from "./isOver.js";
import logger from "./logger.js";

export default async function tweeter(countdownHour, countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureEnd, mode, accuracy, dayCount, pictureSlot) {

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && isOver(countdownHour, countdownDay, countdownMonth, countdownYear)) picture = pictureEnd;

    let message = messageBuilder(countdownHour, countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd);
    console.log(picture);

    try {
        await sendTweet(message, picture);
        player().play('../sounds/notify.mp3');

        //throw 'MyException';
    }
    catch(e) {
        logger('!!!WARNING!!!\n\nTweet not sent!\n\nPicture used:' + picture + '\n\nError log:')
        console.log(e);
    }
}
