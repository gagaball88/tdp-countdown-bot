import luxon from "luxon";
import humanize from "humanize-duration";


export default function messageBuilder(countdownHour, countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd) {
    let newMessageBeta = true;
    
    let start;
    let end;

    
    if(mode === 'countdown') {
        start = luxon.DateTime.local();
        end = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay, countdownHour, 0, 0);
    }
    if(mode === 'countup') {
        start = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay, countdownHour, 0, 0);
        end = luxon.DateTime.local();
    }

    let fullDays = Math.floor(end.diff(start, ['days']).days.valueOf());
    let fullMS = end.diff(start, ['milliseconds']).milliseconds.valueOf();

    let status = "";

    
    if (fullMS > 0) {
        status += message1 + " ";

        if (accuracy === 0) {
            status += humanize(fullMS, {
                language: "en",
                serialComma: false,
                units: ["y"],
                round: true,
                conjunction: " and ",
                })
        }
        
        if (accuracy === 1) {
            status += humanize(fullMS, {
                language: "en",
                serialComma: false,
                units: ["y", "mo"],
                round: true,
                conjunction: " and ",
                })
        }

        if (accuracy === 2) {
            status += humanize(fullMS, {
                language: "en",
                serialComma: false,
                units: ["y", "mo", "d"],
                round: true,
                conjunction: " and ",
                })
        }

        if (accuracy === 3) {
            status += humanize(fullMS, {
                language: "en",
                serialComma: false,
                units: ["y", "mo", "d", "h"],
                round: true,
                conjunction: " and ",
                })
        }

        if (accuracy === 4) {
            status += humanize(fullMS, {
                language: "en",
                serialComma: false,
                units: ["y", "mo", "d", "h", "m"],
                round: true,
                conjunction: " and ",
                })
        }

        if (dayCount) status += ' (or ' + fullDays + ' days)';

        status += message2;

    } else {
        status += messageEnd;
    }

    return status;
}
