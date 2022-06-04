import cron from 'node-cron';
import tweeter from './utils/tweeter.js';
import logger from './utils/logger.js';
import escExit from 'esc-exit';
import player from 'play-sound';
import {sleepSecs} from "twitter-api-v2/dist/v1/media-helpers.v1.js";

///This bot is adjusted to Pacific Time (LA time)

///Accuracy: 0 = Years, 1 = Months, 2 = Days, 3 = Hours, 4 = Minutes

///Slot 1:

let slot1Hour = 9;
let slot1Day = 19;
let slot1Month = 7;
let slot1Year = 2022;

let message1Slot1 = "The Graphic Novel 'Bloodmoon Huntress' will be released in only";
let message2Slot1 = " with a story about young Rayla #TheDragonPrince #BloodmoonHuntress";
let messageEndSlot1 = "The new Graphic Novel 'Bloodmoon Huntress' has been released!! Buy it  here:\n https://amzn.to/3uvaBsO\n\n#TheDragonPrince\n#BloodmoonHuntress";

let pictureEndSlot1 = "./pictures/slot1/9781338784053_203f4.jpg";

///Slot 2:

let slot2Hour = 9;
let slot2Day = 22;
let slot2Month = 11;
let slot2Year = 2019;

let message1Slot2 = "We have been waiting";
let message2Slot2 = " for #TheDragonPrince Season 4 so far!";
let messageEndSlot2 = "";

let pictureEndSlot2 = "";

///Slot 3:

let slot3Hour = 1;
let slot3Day = 9;
let slot3Month = 6;
let slot3Year = 2022;

let message1Slot3 = "In";
let message2Slot3 = " we will get news or sneak peeks of new #TheDragonPrince content at @netflix's #GeekedWeek!!";
let messageEndSlot3 = "Let's see what @netflix #GeekedWeek has in store for #TheDragonPrince fans today! Join the livestream now at https://www.youtube.com/c/Netflix";

let pictureEndSlot3 = "./pictures/slot3/TDPGeekedWeek.jpeg";

///Slot 4:

let slot4Hour = 9;
let slot4Day = 4;
let slot4Month = 4;
let slot4Year = 2023;

let message1Slot4 = "In";
let message2Slot4 = " the Book 3 Novelization 'Sun' of #TheDragonPrince will release!";
let messageEndSlot4 = "";

let pictureEndSlot4 = "";

///Slot template:

///let slot<?>Day = 26;         Day of base date
///let slot<?>Month = 7;        Month of base date
///let slot<?>Year = 2070;      Year of base date

///let message1Slot<?> = "";    First part of the message (followed by time)
///let message2Slot<?> = "";    Second part of the message (after time)
///let messageEndSlot<?> = "";  Message displayed when countdown is done

///let pictureEndSlot<?> = "";  path of the picture accompanying the end message (format : './pictures/slot<?>/picName.XXX')

///----------------------------------------------///

cron.schedule('0 0 * * *', () => slot(-1), true);
cron.schedule('0 1 * * *', () => slot(-1), true);
cron.schedule('0 2 * * *', () => slot(-1), true);
cron.schedule('0 3 * * *', () => slot(4), true);
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
cron.schedule('0 15 * * *', () => slot(3), true);
cron.schedule('0 16 * * *', () => slot(-1), true);
cron.schedule('0 17 * * *', () => slot(-1), true);
cron.schedule('0 18 * * *', () => slot(-1), true);
cron.schedule('0 19 * * *', () => slot(-1), true);
cron.schedule('0 20 * * *', () => slot(-1), true);
cron.schedule('0 21 * * *', () => slot(1), true);
cron.schedule('0 22 * * *', () => slot(-1), true);
cron.schedule('0 23 * * *', () => slot(-1), true);


///Slot definition

///Accuracy: 0 = Years, 1 = Months, 2 = Days, 3 = Hours, 4 = Minutes
///Mode: countdown = time until date, countup = time since date

///slot template: 'if(s === <slot number>) tweeter(slot<?>Day, slot<?>Month, slot<?>Year, message1Slot<?>, message2Slot<?>, messageEndSlot<?>, pictureEndSlot<?>, 'countdown/countup', <accuracy>, <day count true/false>, <picture slot number>).then(() => {});'

function slot(s) {
    if(s === -1) {logger("cronjob inactive: code -1")}; player().play('./sounds/notify.mp3');
    if(s === 1) tweeter(slot1Hour, slot1Day, slot1Month, slot1Year, message1Slot1, message2Slot1, messageEndSlot1, pictureEndSlot1, 'countdown', 4, true, 1).then(() => {});
    if(s === 2) tweeter(slot2Hour, slot2Day, slot2Month, slot2Year, message1Slot2, message2Slot2, messageEndSlot2, pictureEndSlot2, 'countup', 2, true, 2).then(() => {});
    if(s === 3) tweeter(slot3Hour, slot3Day, slot3Month, slot3Year, message1Slot3, message2Slot3, messageEndSlot3, pictureEndSlot3, 'countdown', 3, false, 2).then(() => {});
    if(s === 4) tweeter(slot4Hour, slot4Day, slot4Month, slot4Year, message1Slot4, message2Slot4, messageEndSlot4, pictureEndSlot4, 'countdown', 4, true, 2).then(() => {});
}

///Initialization

console.log("To quit, press ESC or Ctrl-C\n\n");
logger("Bot started successfully\n");
player().play('./sounds/start.mp3');

escExit();

let uptime = 0;

///Uptime message

setInterval(() => {
    uptime = uptime + 12;
    logger("Everything's working fine for " + uptime + " hours now :)");
},  12 * 60 * 60 * 1000 )


sleepSecs(1).then(r => slot(-1));
sleepSecs(2).then(r => slot(1));
sleepSecs(3).then(r => slot(2));
sleepSecs(4).then(r => slot(3));
sleepSecs(5).then(r => slot(4));
