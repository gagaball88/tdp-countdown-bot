//get file names: ls | sed 's/.*/"&",/'

const paths = [
//add file names here
]


function exportPaths() {
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}

module.exports = {
    exportPaths
};
