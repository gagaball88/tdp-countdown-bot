import luxon from "luxon";


export default function messageBuilder(countdownDay, countdownMonth, countdownYear, mode, accuracy, dayCount, message1, message2, messageEnd) {
    let start;
    let end;
    
    if(mode === 'countdown') {
        start = luxon.DateTime.now();
        end = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay);
    }
    if(mode === 'countup') {
        start = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay);
        end = luxon.DateTime.now();
    }

    let fullDays = Math.floor(end.diff(start, ['days']).days.valueOf());
    let fullMS = end.diff(start, ['milliseconds']).milliseconds.valueOf();

    let diffDuration = end.diff(start, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

    let years = diffDuration.years.valueOf();
    let months = diffDuration.months.valueOf();
    let days = diffDuration.days.valueOf();
    let hours = diffDuration.hours.valueOf();
    let minutes = diffDuration.minutes.valueOf();

    let status = "";
    if (fullMS > 0) {

        status += message1;

        if(accuracy >= 0) {
            if (years > 1) {
                status += ` ${years} years`;
            } else if (months === 1) {
                status += ` ${years} year`;
            }
            if(accuracy === 0 && dayCount === true) status += ' (or ' + fullDays + ' days)';

        }

        if(accuracy >= 1) {
            if((accuracy === 2 && days == 0) || (accuracy === 1 && months !== 0) ||(days === 0 && hours === 0 && minutes === 0)) status += " and"
            if (months > 1) {
                status += ` ${months} months`;
            } else if (months === 1) {
                status += ` ${months} month`;
            }
            if(accuracy === 1 && dayCount === true) status += ' (or ' + fullDays + ' days)';

        }

        if(accuracy >= 2) {
            if((accuracy === 3 && hours == 0) || (accuracy === 2 && days !== 0) || (hours === 0 && minutes === 0)) status += " and"
            if (days > 1) {
                status += ` ${days} days`;
            } else if (days === 1) {
                status += ` ${days} day`;
            }
            if(accuracy === 2 && dayCount === true) status += ' (or ' + fullDays + ' days)';
        }

        if(accuracy >= 3) {
            if((accuracy === 4 && minutes == 0) || (accuracy === 3 && hours !== 0) || (minutes === 0)) status += " and"
            if (hours > 1) {
                status += ` ${hours} hours`;
            } else if (hours === 1) {
                status += ` ${hours} hour`;
            }
            if(accuracy === 3 && dayCount === true) status += ' (or ' + fullDays + ' days)';

        }

        if(accuracy >= 4) {
            if(accuracy === 4 && minutes !== 0) status += " and"
            if (minutes > 1) {
                status += ` ${minutes} minutes`;
            } else if (minutes === 1) {
                status += ` ${minutes} minute`;
            }
            if(accuracy === 4 && dayCount === true) status += ' (or ' + fullDays + ' days)';

        }

        status += message2;

    } else {
        status += messageEnd;
    }

    return status;
}