import cron from 'node-cron';
import tweeter from './utils/tweeter.js';
import logger from './utils/logger.js';
import escExit from 'esc-exit';
import player from 'play-sound';
import {sleepSecs} from "twitter-api-v2/dist/v1/media-helpers.v1.js";

///Accuracy: 0 = Years, 1 = Months, 2 = Days, 3 = Hours, 4 = Minutes

let slot1Day = 19;
let slot1Month = 7;
let slot1Year = 2022;

let slot2Day = 22;
let slot2Month = 11;
let slot2Year = 2019;

let slot3Day = 26;
let slot3Month = 7;
let slot3Year = 2070;

let slot4Day = 26;
let slot4Month = 7;
let slot4Year = 2070;

let message1Slot1 = "The Graphic Novel 'Bloodmoon Huntress' will be released in only";
let message2Slot1 = " with a story about young Rayla #TheDragonPrince #BloodmoonHuntress";
let messageEndSlot1 = "The new Graphic Novel 'Bloodmoon Huntress' has been released!! Buy it  here:\n https://amzn.to/3uvaBsO\n\n#TheDragonPrince\n#BloodmoonHuntress";

let message1Slot2 = "We have been waiting";
let message2Slot2 = " for #TheDragonPrince Season 4 so far!";
let messageEndSlot2 = "";

let message1Slot3 = "slot 3 inactive";
let message2Slot3 = " ";
let messageEndSlot3 = "";

let message1Slot4 = "slot 4 inactive";
let message2Slot4 = " ";
let messageEndSlot4 = "";

let pictureEndSlot1 = "./pictures/slot1/vlcsnap-2022-02-04-21h25m30s800.png";
let pictureEndSlot2 = "";
let pictureEndSlot3 = "";
let pictureEndSlot4 = "";

cron.schedule('0 0 * * *', () => slot(-1), true);
cron.schedule('0 1 * * *', () => slot(-1), true);
cron.schedule('0 2 * * *', () => slot(-1), true);
cron.schedule('0 3 * * *', () => slot(1), true);
cron.schedule('0 4 * * *', () => slot(-1), true);
cron.schedule('0 5 * * *', () => slot(-1), true);
cron.schedule('0 6 * * *', () => slot(-1), true);
cron.schedule('0 7 * * *', () => slot(-1), true);
cron.schedule('0 8 * * *', () => slot(-1), true);
cron.schedule('0 9 * * *', () => slot(2), true);
cron.schedule('0 10 * * *', () => slot(-1), true);
cron.schedule('0 11 * * *', () => slot(-1), true);
cron.schedule('0 12 * * *', () => slot(-1), true);
cron.schedule('0 13 * * *', () => slot(-1), true);
cron.schedule('0 14 * * *', () => slot(-1), true);
cron.schedule('0 15 * * *', () => slot(1), true);
cron.schedule('0 16 * * *', () => slot(-1), true);
cron.schedule('0 17 * * *', () => slot(-1), true);
cron.schedule('0 18 * * *', () => slot(-1), true);
cron.schedule('0 19 * * *', () => slot(-1), true);
cron.schedule('0 20 * * *', () => slot(-1), true);
cron.schedule('0 21 * * *', () => slot(-1), true);
cron.schedule('0 22 * * *', () => slot(-1), true);
cron.schedule('0 23 * * *', () => slot(-1), true);

///Accuracy: 0 = Years, 1 = Months, 2 = Days, 3 = Hours, 4 = Minutes
///Mode: countdown = time until date, countup = time since date

function slot(s) {
    if(s === -1) {logger("cronjob inactive: code -1")}; player().play('./sounds/notify.mp3');
    if(s === 1) tweeter(slot1Day, slot1Month, slot1Year, message1Slot1, message2Slot1, messageEndSlot1, pictureEndSlot1, 'countdown', 4, true, 1).then(() => {});
    if(s === 2) tweeter(slot2Day, slot2Month, slot2Year, message1Slot2, message2Slot2, messageEndSlot2, pictureEndSlot2, 'countup', 2, true, 2).then(() => {});
    if(s === 3) tweeter(slot3Day, slot3Month, slot3Year, message1Slot3, message2Slot3, messageEndSlot3, pictureEndSlot3, 'countdown', 4, false, 3).then(() => {});
    if(s === 4) tweeter(slot4Day, slot4Month, slot4Year, message1Slot4, message2Slot4, messageEndSlot4, pictureEndSlot4, 'countdown', 4, false, 4).then(() => {});
}

console.log("To quit, press ESC or Ctrl-C\n\n");
logger("Bot started successfully\n");
player().play('./sounds/start.mp3');

escExit();

let uptime = 0;

setInterval(() => {
    uptime = uptime + 12;
    logger("Everything's working fine for " + uptime + " hours now :)");
},  12 * 60 * 60 * 1000 )


//sleepSecs(2).then(r => slot(-1));
//sleepSecs(3).then(r => slot(1));
//sleepSecs(4).then(r => slot(2));
//sleepSecs(3).then(r => slot(3));
//sleepSecs(3).then(r => slot(4));