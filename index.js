var through = require("through2");
var path = require("path");
var fs = require("fs");

module.exports = function (options) {
    var opt = {
        maxsize: 1,  //小于该值的图片将会被编译为base64，单位为kb
        ignore: null,  //用于过滤部分不想编译的图片名
        pathrep: null  //将路由地址的图片路径替换成相对地址,格式为{reg:'',rep:''}
    }
    var URL_REG = /("|'|\()(\/?[^"'()]*\/)*?[^."'()]*?\.(png|jpg|gif)(\?[^?]*)?("|'|\))/g;

    for (var k in options) {
        if (!(k in opt)) continue;
        opt[k] = options[k]
    }

    var imgPath, i, ref;
    var ignore = opt.ignore,
        maxsize = typeof +opt.maxsize === "number" ? +opt.maxsize : 1,
        pathrep = typeof opt.pathrep === "object" ? opt.pathrep : null;
    var _transform = function (file, encoding, done) {
        var str = String(file.contents);
        var p = file.path.substring(0, file.path.lastIndexOf("\\"));

        str = str.replace(URL_REG, function (m) {
            //判断ignore的值并进行相应处理
            if(ignore){
                if (typeof ignore === "string") {
                    if (m.indexOf(ignore) >= 0) return m
                } else if ('splice' in ignore) {
                    ref = false;
                    for (i = 0; i < ignore.length; i++) {
                        if(typeof ignore[i] === "string" && m.indexOf(ignore[i]) >= 0){
                            ref = true;
                            break;
                        }
                    }
                    if(ref) return m;
                }else if(ignore instanceof RegExp){
                    if(m.match(ignore)) return m;
                }
            }

            imgPath = m;
            var q = imgPath.charAt(0);      //获取首字符
            var h = imgPath.charAt(imgPath.length - 1);   //获取尾字符
            imgPath = imgPath.substring(1, imgPath.length - 1);      //获取路径内容
            var fk = imgPath.substring(imgPath.lastIndexOf(".") + 1, imgPath.length);        //获取图片后缀名

            //如果是路由地址，则替换为相对地址，否则根据文件位置匹配出相应的绝对地址
            if(pathrep && (pathrep.reg instanceof RegExp) && m.match(pathrep.reg)){
                imgPath = imgPath.replace(pathrep.reg , pathrep.rep || "");
            }else {
                imgPath = path.resolve(p, imgPath);
            }

            try {
                var stats = fs.statSync(imgPath);
                //如果图片文件小于1kb则替换为base64格式
                if (stats.size / 1024 < maxsize) {
                    var baseStr = fs.readFileSync(imgPath).toString("base64");
                    imgPath = q + "data:image/" + fk + ";base64," + baseStr + h;
                    //console.log(file.path)
                    //console.log(m +" ==> [length:"+imgPath.length+"]" + imgPath.substring(0 , 50) + "..." + imgPath.substring(imgPath.length-10 , imgPath.length))
                    return imgPath;
                }
            } catch (e) {}

            return m;
        });

        file.contents = new Buffer(str);
        done(null , file);
    }

    return through.obj(_transform)
}