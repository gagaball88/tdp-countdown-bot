//get file names: ls | sed 's/.*/"&",/'

const paths = [
    "vlcsnap-2022-02-04-21h23m18s080.png",

]


exports.randomPicture = function() {
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}