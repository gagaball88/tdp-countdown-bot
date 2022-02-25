import sendTweet from"./sendTweet.js";
import messageBuilder from"./messageBuilder.js";
import refreshPic from "./refreshPic.js";
import player from "play-sound";
import isOver from "./isOver.js";

export default async function tweeter(countdownDay, countdownMonth, countdownYear, message1, message2, messageEnd, pictureEnd, mode, accuracy, dayCount, pictureSlot) {

    let picture = refreshPic(pictureSlot);

    if (mode === 'countdown' && isOver()) picture = pictureEnd;

    let message = messageBuilder(countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd);

    await sendTweet(message, picture);
    player().play('../sounds/notify.mp3');

    //console.log(message + " " + picture);
}
