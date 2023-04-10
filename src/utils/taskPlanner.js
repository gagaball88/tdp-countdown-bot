import isOver from "./isOver.js";
import initPost from "./initPost.js"
import logger from './logger.js';
import player from 'play-sound';
import { DateTime } from "luxon";


let over

export default function taskPlanner(s) {
    over = isOver(s[0], s[1], s[2], s[3], s[9])
    let ms = getMilliseconds(s);

    //console.log("slot: " + s[5] + " - " + ms + "\n\n");

    const d = new Date();
    let hour = d.getHours();
    let minute = d.getMinutes();

    //console.log("hour: " + hour + " - minute: " + minute + " - minute divided by 5 - " + minute % 5 + "\n\n");


    if (!over && ms >= 86400000) {
        if (s[13] === hour && minute === 0) {
            //console.log("activate option 1 (everyday)");

            poster(s);
        }
    }

    if (!over && ms < 86400000 && ms >= 3600000) {
        if (minute === 0) {
            //console.log("activate option 2 (every hour)");

            poster(s);
        }
    }

    if (!over && ms < 3600000 && ms >= 300000) {
        if (minute === 0 || minute % 5 === 0) {
        //if (minute === 0 || minute % 5 === 0) { 
            //console.log("activate option 3 (every 5 minutes)");

            poster(s);
        }    
    }

    if (!over && ms < 300000) {
        //console.log("activate option 4 (every minute)");

        poster(s);
    }
    if (over && ms <= 60000) {

        poster(s);

    }

    //initTweet(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[9], s[10], s[11], s[12], over).then(() => {});
}

function getMilliseconds(s) {
    let start = DateTime.now();
    let end = DateTime.local(s[3], s[2], s[1], s[0], 0, 0);
    let ms = Math.abs(end.diff(start, ['milliseconds']).milliseconds.valueOf());
    return ms;
}

function poster(s) {
    if (s[8]) initPost(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[9], s[10], s[11], s[12], over).then(() => {});
    else {
        logger("slot inactive");
        player().play('./sounds/notify.mp3');
    }

}