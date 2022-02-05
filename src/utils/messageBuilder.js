const moment = require("moment");

exports.countdownMessage = function(diffTime,message1, message2, messageEnd) {
    let diffDuration = moment.duration(diffTime, "milliseconds");
    let status = "";
    if (diffTime > 0) {
        //add new slots here!
        status += message1;

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
        status += message2;

    } else {
        //add new slots here!
        status += messageEnd;
    }

    return status;
}