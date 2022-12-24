import fs from 'fs'

export default function refreshPic(slot) {
    return `./pictures/slot${slot}/${getPicture(slot)}`
}


function getPicture(slot) {  
    let paths = fs.readdirSync(`</full/path/to/picture/folder/with/slot/subfolders/slot${slot}/>`);
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}
