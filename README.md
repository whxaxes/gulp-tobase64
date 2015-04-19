# gulp-tobase64
image to base64

自用插件，可以将css、html中的图片转成base64格式

##Install

    npm install gulp-tobase64

##Usage

    var tobase64 = require("gulp-tobase64");
    tobase64(options);

###demo

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

##API

###maxsize

当图片文件大小小于该值时才会被编译成base64，默认值为1，单位为kb

###ignore

用于忽略匹配的图片文件路径，传入的参数可以为字符串，数组，或正则，例：'image'或['image','abc']或/\/abc\//g

###pathrep

html中的img有可能用的是路由地址，比如'/public/images/XX.png'，该参数用于将路由地址转为相对地址以获取图片。格式如上demo，reg为正则，rep为要替换的路径
