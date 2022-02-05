const cron = require('node-cron');
const moment = require("moment");
const fs = require("fs");

let {exportPaths} = require("./databases/pictures");
let twitter = require('./utils/tweet')

let paths;

let countdownDay;
let countdownMonth;
let countdownYear;

async function tweeter(slot) {

    //add new slots here!
    if (slot === 0) {
        countdownDay = 19;
        countdownMonth = 7;
        countdownYear = 2022;
    }

    if (slot !== -1) {
        refreshPics();
        const diffTime = calcTimeDifference(countdownDay, countdownMonth, countdownYear, slot);
        let message = countdownMessage(diffTime, slot);
        let imageData = getImageData();
        await twitter.tweet(message, imageData);
    }
    else console.log("skipped cronjob: code -1");
}

function refreshPics() {
    paths = exportPaths();
}

function calcTimeDifference(countdownDay, countdownMonth, countdownYear, slot) {
    if (slot !== -1) {
        //Get current date and time
        let currentDate = new Date();
        //insert local offset snippet here
        const currentTime = currentDate.getTime();
        //Convert countdown date to UTC
        const countdownDate = new Date(Date.UTC(countdownYear, countdownMonth - 1, countdownDay, 0, 0, 0, 1));
        const countdownTime = countdownDate.getTime();
        //Calculate time difference
        return countdownTime - currentTime;
    }
}

function countdownMessage(diffTime, slot) {
    let diffDuration = moment.duration(diffTime, "milliseconds");
    let status = "";
    if (diffTime > 0) {
        //add new slots here!
        if (slot === 0) status += "The Graphic Novel 'Bloodmoon Huntress' will be released in only";

        if (diffDuration.months() > 1) {
            status += ` ${diffDuration.months()} months`;
        } else if (diffDuration.months() === 1) {
            status += ` ${diffDuration.months()} month`;
        }

        if (diffDuration.days() > 1) {
            status += ` ${diffDuration.days()} days`;
        } else if (diffDuration.days() === 1) {
            status += ` ${diffDuration.days()} day`;
        }

        if (diffDuration.hours() > 1) {
            status += ` ${diffDuration.hours()} hours`;
        } else if (diffDuration.hours() === 1) {
            status += ` ${diffDuration.hours()} hour`;
        }

        if (diffDuration.minutes() > 1) {
            status += ` ${diffDuration.minutes()} minutes`;
        } else if (diffDuration.minutes() === 1) {
            status += ` ${diffDuration.minutes()} minute`;
        }
        //add new slots here!
        if (slot === 0) status += " with a story about young Rayla #TheDragonPrince #BloodmoonHuntress";

    } else {
        //add new slots here!
        if (slot === 0) status += "";
    }

    return status;
}

function getImageData() {
    return fs.readFileSync("./pictures/" + paths);
}

cron.schedule('0 0 * * *', () => tweeter(-1), true);
cron.schedule('0 1 * * *', () => tweeter(-1), true);
cron.schedule('0 2 * * *', () => tweeter(-1), true);
cron.schedule('0 3 * * *', () => tweeter(-1), true);
cron.schedule('0 4 * * *', () => tweeter(-1), true);
cron.schedule('0 5 * * *', () => tweeter(-1), true);
cron.schedule('0 6 * * *', () => tweeter(-1), true);
cron.schedule('0 7 * * *', () => tweeter(-1), true);
cron.schedule('0 8 * * *', () => tweeter(-1), true);
cron.schedule('0 9 * * *', () => tweeter(0), true);
cron.schedule('0 10 * * *', () => tweeter(-1), true);
cron.schedule('0 11 * * *', () => tweeter(-1), true);
cron.schedule('0 12 * * *', () => tweeter(-1), true);
cron.schedule('0 13 * * *', () => tweeter(-1), true);
cron.schedule('0 14 * * *', () => tweeter(-1), true);
cron.schedule('0 15 * * *', () => tweeter(-1), true);
cron.schedule('0 16 * * *', () => tweeter(-1), true);
cron.schedule('0 17 * * *', () => tweeter(-1), true);
cron.schedule('0 18 * * *', () => tweeter(-1), true);
cron.schedule('0 19 * * *', () => tweeter(-1), true);
cron.schedule('0 20 * * *', () => tweeter(-1), true);
cron.schedule('0 21 * * *', () => tweeter(0), true);
cron.schedule('0 22 * * *', () => tweeter(-1), true);
cron.schedule('0 23 * * *', () => tweeter(-1), true);

console.log("Bot started successfully");

setInterval(() => {
console.log("Everything's working fine :)");
}, 60 * 60 * 24 * 1000)


//tweeter(0).then(() => {});



/**
 * for time zone offsets:
 *
 * const localoffset = -(today1.getTimezoneOffset() / 60);
 const destoffset = +2;
 const offset1 = destoffset - localoffset;
 currentDate = new Date(new Date(new Date().getTime() + offset1 * 3600 * 1000));
 */
