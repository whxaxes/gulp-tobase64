# gulp-tobase64

### A simple gulp plugin, used to transform image into base64 string.

## Install

    npm install gulp-tobase64

## Usage

    var tobase64 = require("gulp-tobase64");
    tobase64(options);

### Example

    var tobase64 = require("gulp-tobase64");
    gulp.task('build-html' , function(){
      return gulp.src("./html-init/**/*.html")
          .pipe(tobase64({
              maxsize:0.5,        
              ignore:'image_loading.png',
              pathrep: {
                  reg:/\/public\/bizapp\d*\//g ,
                  rep:'./public/'
              }
          }))
          .pipe(gulp.dest("./html"))
    });

## API

### maxsize
It will be compiled into base64 when the image size is less than this value, the default value is 1 and the unit is 'KB'

### ignore
It's used to ignore files, it can be string,array or regular. <br>
```
'image' , ['image','abc'] or /\/abc\//g
```

### pathrep
It's used to transform file path into readable path like this :
```
/public/bizapp1007/image.png ==> ./public/image.png
```