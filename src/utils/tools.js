const collection1 = require("../databases/collection1");
const collection2 = require("../databases/collection2");
const collection3 = require("../databases/collection3");
const collection4 = require("../databases/collection4");
const fs = require("fs");

exports.calcTimeDifference = function(countdownDay, countdownMonth, countdownYear, slot) {
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

exports.refreshPic = function(slot) {
    if (slot === 1) return collection1.randomPicture();
    if (slot === 2) return collection2.randomPicture();
    if (slot === 3) return collection3.randomPicture();
    if (slot === 4) return collection4.randomPicture();

}

exports.getImageData = function(picture) {
    return fs.readFileSync("./pictures/" + picture);
}

/**
 * for time zone offsets:
 *
 * const localoffset = -(today1.getTimezoneOffset() / 60);
 const destoffset = +2;
 const offset1 = destoffset - localoffset;
 currentDate = new Date(new Date(new Date().getTime() + offset1 * 3600 * 1000));
 */
