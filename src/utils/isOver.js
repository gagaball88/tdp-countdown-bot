import { DateTime } from "luxon";

export default function isOver(dateDetails) {
    const { hour, day, month, year, mode } = dateDetails;
    let start = DateTime.now();
    let end = DateTime.local(year, month, day, hour, 0, 0);
    let ms = end.diff(start, ['milliseconds']).milliseconds.valueOf();

    if (ms <= 0 && mode == "countdown") return true;
    else if (ms <= 0 && mode == "countup") return false;
    else return false;
}
