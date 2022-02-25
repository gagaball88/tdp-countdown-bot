import collection1 from "../databases/collection1.js";
import collection2 from "../databases/collection2.js";
import collection3 from "../databases/collection3.js";
import collection4 from "../databases/collection4.js";

export default function refreshPic(slot) {
    if (slot === 1) return "./pictures/slot1/" + collection1();
    if (slot === 2) return "./pictures/slot2/" + collection2();
    if (slot === 3) return "./pictures/slot3/" + collection3();
    if (slot === 4) return "./pictures/slot4/" + collection4();
}
