import { DateTime } from "luxon";

export default function isOver(countdownHour, countdownDay, countdownMonth, countdownYear, mode) {
    let start = DateTime.now();
    let end = DateTime.local(countdownYear, countdownMonth, countdownDay, countdownHour, 0, 0);
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();

    if (ms <= 0 && mode == "countdown") return true;
    else if (ms <= 0 && mode == "countup") return false;
    else return false;
}
