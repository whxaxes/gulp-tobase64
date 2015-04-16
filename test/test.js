var tobase64 = require("../");
var vfs = require("vinyl-fs");

vfs.src(['./ref/test.html' , './ref/css/test.css'])
    .pipe(tobase64({
        ignore:'img_2.png',
        pathrep:{
            reg:/\/public\//g ,
            rep:'./ref/'
        }
    }))
    .pipe(vfs.dest("./dist/"));
