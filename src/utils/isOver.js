import luxon from "luxon";

export default function isOver(countdownDay, countdownMonth, countdownYear) {
    let start = luxon.DateTime.now();
    let end = luxon.DateTime.local(countdownYear, countdownMonth, countdownDay);
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();

    if(ms <= 0) return true;
    else return false;
}