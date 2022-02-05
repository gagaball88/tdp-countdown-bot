const cron = require('node-cron');

const tweeter = require("./utils/tweeter");

let slot1Day = 19;
let slot1Month = 7;
let slot1Year = 2022;

let slot2Day = 26;
let slot2Month = 7;
let slot2Year = 2070;

let slot3Day = 26;
let slot3Month = 7;
let slot3Year = 2070;

let slot4Day = 26;
let slot4Month = 7;
let slot4Year = 2070;

let message1Slot1 = "The Graphic Novel 'Bloodmoon Huntress' will be released in only";
let message2Slot1 = " with a story about young Rayla #TheDragonPrince #BloodmoonHuntress";
let messageEndSlot1 = "";

let message1Slot2 = "slot 2 inactive";
let message2Slot2 = " ";
let messageEndSlot2 = "";

let message1Slot3 = "slot 3 inactive";
let message2Slot3 = " ";
let messageEndSlot3 = "";

let message1Slot4 = "slot 4 inactive";
let message2Slot4 = " ";
let messageEndSlot4 = "";

cron.schedule('0 0 * * *', () => slot(-1), true);
cron.schedule('0 1 * * *', () => slot(-1), true);
cron.schedule('0 2 * * *', () => slot(-1), true);
cron.schedule('0 3 * * *', () => slot(-1), true);
cron.schedule('0 4 * * *', () => slot(-1), true);
cron.schedule('0 5 * * *', () => slot(-1), true);
cron.schedule('0 6 * * *', () => slot(-1), true);
cron.schedule('0 7 * * *', () => slot(-1), true);
cron.schedule('0 8 * * *', () => slot(-1), true);
cron.schedule('0 9 * * *', () => slot(1), true);
cron.schedule('0 10 * * *', () => slot(-1), true);
cron.schedule('0 11 * * *', () => slot(-1), true);
cron.schedule('0 12 * * *', () => slot(-1), true);
cron.schedule('0 13 * * *', () => slot(-1), true);
cron.schedule('0 14 * * *', () => slot(-1), true);
cron.schedule('0 15 * * *', () => slot(-1), true);
cron.schedule('0 16 * * *', () => slot(-1), true);
cron.schedule('0 17 * * *', () => slot(-1), true);
cron.schedule('0 18 * * *', () => slot(-1), true);
cron.schedule('0 19 * * *', () => slot(-1), true);
cron.schedule('0 20 * * *', () => slot(-1), true);
cron.schedule('0 21 * * *', () => slot(1), true);
cron.schedule('0 22 * * *', () => slot(1), true);
cron.schedule('0 23 * * *', () => slot(-1), true);

console.log("Bot started successfully");

setInterval(() => {
console.log("Everything's working fine :)");
}, 60 * 60 * 24 * 1000)

function slot(s) {
    if(s === -1) {console.log("cronjob inactive: code -1")}
    if(s === 1) tweeter.send(slot1Day, slot1Month, slot1Year, message1Slot1, message2Slot1, messageEndSlot1, 1).then(() => {});
    if(s === 2) tweeter.send(slot2Day, slot2Month, slot2Year, message1Slot2, message2Slot2, messageEndSlot2, 2).then(() => {});
    if(s === 3) tweeter.send(slot3Day, slot3Month, slot3Year, message1Slot3, message2Slot3, messageEndSlot3, 3).then(() => {});
    if(s === 4) tweeter.send(slot4Day, slot4Month, slot4Year, message1Slot4, message2Slot4, messageEndSlot4, 4).then(() => {});
}

//slot(-1);



