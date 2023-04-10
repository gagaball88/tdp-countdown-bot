import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function refreshPic(slot) {
    return `./pictures/slot${slot}/${getPicture(slot)}`
}


function getPicture(slot) {  
    let paths = fs.readdirSync(path.resolve(__dirname, `../pictures/slot${slot}/`));
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}