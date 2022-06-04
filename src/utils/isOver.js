import luxon from "luxon";

export default function isOver(countdownHour, countdownDay, countdownMonth, countdownYear) {
    let start = luxon.DateTime.now();
    let end = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay, countdownHour, 0, 0);
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();
    console.log('milliseconds until release: ' + ms);

    if(ms <= 0) return true;
    else return false;
}
