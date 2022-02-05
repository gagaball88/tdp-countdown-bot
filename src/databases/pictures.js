//get file names: ls | sed 's/.*/"&",/'

const paths = [
"vlcsnap-2022-02-04-20h50m11s125.png",
"vlcsnap-2022-02-04-21h16m19s696.png",
"vlcsnap-2022-02-04-21h16m48s887.png",
"vlcsnap-2022-02-04-21h17m04s035.png",
"vlcsnap-2022-02-04-21h17m17s006.png",
"vlcsnap-2022-02-04-21h17m20s489.png",
"vlcsnap-2022-02-04-21h17m49s084.png",
"vlcsnap-2022-02-04-21h18m03s923.png",
"vlcsnap-2022-02-04-21h18m11s336.png",
"vlcsnap-2022-02-04-21h18m20s197.png",
"vlcsnap-2022-02-04-21h18m22s653.png",
"vlcsnap-2022-02-04-21h18m24s750.png",
"vlcsnap-2022-02-04-21h18m26s555.png",
"vlcsnap-2022-02-04-21h18m41s955.png",
"vlcsnap-2022-02-04-21h18m43s543.png",
"vlcsnap-2022-02-04-21h18m49s872.png",
"vlcsnap-2022-02-04-21h18m55s409.png",
"vlcsnap-2022-02-04-21h18m59s422.png",
"vlcsnap-2022-02-04-21h19m04s632.png",
"vlcsnap-2022-02-04-21h19m15s292.png",
"vlcsnap-2022-02-04-21h19m24s736.png",
"vlcsnap-2022-02-04-21h19m32s786.png",
"vlcsnap-2022-02-04-21h19m39s377.png",
"vlcsnap-2022-02-04-21h19m44s274.png",
"vlcsnap-2022-02-04-21h20m01s821.png",
"vlcsnap-2022-02-04-21h20m16s248.png",
"vlcsnap-2022-02-04-21h20m20s376.png",
"vlcsnap-2022-02-04-21h20m31s928.png",
"vlcsnap-2022-02-04-21h20m51s836.png",
"vlcsnap-2022-02-04-21h21m02s462.png",
"vlcsnap-2022-02-04-21h21m35s104.png",
"vlcsnap-2022-02-04-21h21m39s089.png",
"vlcsnap-2022-02-04-21h22m24s996.png",
"vlcsnap-2022-02-04-21h22m39s107.png",
"vlcsnap-2022-02-04-21h22m43s143.png",
"vlcsnap-2022-02-04-21h22m53s436.png",
"vlcsnap-2022-02-04-21h22m58s181.png",
"vlcsnap-2022-02-04-21h23m07s643.png",
"vlcsnap-2022-02-04-21h23m18s080.png",
"vlcsnap-2022-02-04-21h23m26s956.png",
"vlcsnap-2022-02-04-21h23m34s690.png",
"vlcsnap-2022-02-04-21h23m38s845.png",
"vlcsnap-2022-02-04-21h23m42s063.png",
"vlcsnap-2022-02-04-21h23m45s219.png",
"vlcsnap-2022-02-04-21h23m50s969.png",
"vlcsnap-2022-02-04-21h24m01s425.png",
"vlcsnap-2022-02-04-21h24m06s225.png",
"vlcsnap-2022-02-04-21h24m17s271.png",
"vlcsnap-2022-02-04-21h24m21s557.png",
"vlcsnap-2022-02-04-21h24m30s967.png",
"vlcsnap-2022-02-04-21h24m34s589.png",
"vlcsnap-2022-02-04-21h24m46s663.png",
"vlcsnap-2022-02-04-21h24m54s598.png",
"vlcsnap-2022-02-04-21h25m02s483.png",
"vlcsnap-2022-02-04-21h25m06s549.png",
"vlcsnap-2022-02-04-21h25m09s237.png",
"vlcsnap-2022-02-04-21h25m18s100.png",
"vlcsnap-2022-02-04-21h25m23s031.png",
"vlcsnap-2022-02-04-21h25m25s778.png",
"vlcsnap-2022-02-04-21h25m30s800.png",


]


function exportPaths() {
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}

module.exports = {
    exportPaths
};
