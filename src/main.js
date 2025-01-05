import logger from './utils/logger.js';
import taskPlanner from './utils/taskPlanner.js';
import escExit from 'esc-exit';
import player from 'play-sound';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let config = require("./config/config.json");

let slotHour, slotDay, slotMonth, slotYear, message1Slot, message2Slot, messageEndSlot, pictureEndSlot, activeSlot, modeSlot, accuracySlot, dayCountSlot, pictureSlot, postTimeSlot

function updateVariables() {

    delete require.cache[require.resolve('./config/config.json')]   // Deleting loaded module
    config = require("./config/config.json");

    for (var i = 0; i < config.slots.length; i++) {
        slotHour = config.slots[i].hour;
        slotDay = config.slots[i].day;
        slotMonth = config.slots[i].month;
        slotYear = config.slots[i].year;

        message1Slot = config.slots[i].message1;
        message2Slot = config.slots[i].message2;
        messageEndSlot = config.slots[i].messageEnd;

        pictureEndSlot = config.slots[i].pictureEnd;

        activeSlot = config.slots[i].active;
        modeSlot = config.slots[i].mode;
        accuracySlot = config.slots[i].accuracy;
        dayCountSlot = config.slots[i].dayCount;
        pictureSlot = config.slots[i].pictureSlot;
        postTimeSlot = config.slots[i].postTime;

        taskPlanner([
            /*0: hour to count to/from*/        slotHour,
            /*1: day to count to/from*/         slotDay,
            /*2: month to count to/from*/       slotMonth,
            /*3: year to count to/from*/        slotYear,
            /*4: message before time*/          message1Slot,
            /*5: message after time*/           message2Slot,
            /*6: message for end message*/      messageEndSlot,
            /*7: filename of end picture*/      pictureEndSlot,
            /*8: is slot active? 
                (true/false)*/                  activeSlot,
            /*9: "countdown/countup"*/          modeSlot,
            /*10: accuracy of time output: 
                0 = Years,
                1 = Months, 
                2 = Days, 
                3 = Hours, 
                4 = Minutes, 
                5 = Dynamic*/                   accuracySlot,
            /*11: is day count active 
                (true/false)*/                  dayCountSlot,
            /*12: picture category selection
                (example: "s3e5,s3e9")*/        pictureSlot,
            /*13: hour of the day*/             postTimeSlot
        ]);

    }

}

///Initialization

console.log("To quit, press ESC or Ctrl-C\n\n");
logger("Bot started successfully\n");
player().play('./sounds/start.mp3');


escExit();

let uptime = 0;

updateVariables()

///Uptime message

setInterval(() => {
    uptime = uptime + 12;
    logger("Everything's working fine for " + uptime + " hours now :)");
}, 12 * 60 * 60 * 1000)

setInterval(() => {
    updateVariables()
}, 60 * 1000)