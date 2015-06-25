var through = require("through2");
var path = require("path");
var fs = require("fs");
var URL_REG = /("|'|\()((?:\/?(?:[\w.-]|\.|\.\.)*\/)*?[\w-]*?\.(png|jpg|gif|bmp))(?:\?[\w=]*)?("|'|\))/g;

module.exports = function (options) {
    var opt = {
        maxsize: 1,  //小于该值的图片将会被编译为base64，单位为kb
        ignore: null,  //用于过滤部分不想编译的图片名
        pathrep: null  //将路由地址的图片路径替换成相对地址,格式为{reg:'',rep:''}
    };

    options = (typeof options === "object") ? options : {};
    for (var k in options) {
        if (!(k in opt)) continue;
        opt[k] = options[k];
    }

    var ignore = opt.ignore,
        maxsize = typeof +opt.maxsize === "number" ? +opt.maxsize : 1,
        pathrep = typeof opt.pathrep === "object" ? opt.pathrep : null;

    //将ignore参数转成正则
    var type = Object.prototype.toString.call(ignore);
    var RE;
    if(type === "[object Array]"){
        RE = new RegExp(formateRe(ignore.join("|")) , 'g');
    }else if(type === "[object String]"){
        RE = new RegExp(formateRe(ignore) , 'g');
    }else if(type === "[object RegExp]"){
        RE = ignore;
    }

    var _transform = function (file, encoding, done) {
        var str = String(file.contents);
        var p = file.path.substring(0, file.path.lastIndexOf("\\"));
        var count = 0;
        str = str.replace(URL_REG, function (m) {
            var prefix = RegExp.$1;       //$1为匹配的开头的"或'或(
            var suffix = RegExp.$4;       //$4为匹配的结尾的"或'或)
            var imgkind = RegExp.$3;      //$3为匹配的图片类型
            var imgPath = RegExp.$2;      //$2为路径内容

            //判断ignore的值并进行相应处理
            if(RE && RE.test(m)){
                RE.lastIndex = 0;   //重置RE索引
                return m;
            }

            //如果是路由地址，则替换为相对地址，否则根据文件位置匹配出相应的绝对地址
            if (pathrep && (pathrep.reg instanceof RegExp) && m.match(pathrep.reg)) {
                imgPath = imgPath.replace(pathrep.reg, pathrep.rep || "");
            } else {
                imgPath = path.resolve(p, imgPath);
            }

            if (!fs.existsSync(imgPath)) {
                console.log("\x1B[31mFile is not found:" + imgPath + "\x1B[0m");
                return m;
            }

            //如果图片文件小于1kb则替换为base64格式
            if ((fs.statSync(imgPath).size / 1024) < maxsize) {
                var baseStr = fs.readFileSync(imgPath).toString("base64");
                imgPath = prefix + "data:image/" + imgkind + ";base64," + baseStr + suffix;
                count++;
                return imgPath;
            }

            return m;
        });

        if (count)console.log("\x1B[32m" + file.path + " has " + count + " change\x1B[0m");

        file.contents = new Buffer(str);

        done(null, file);
    };

    return through.obj(_transform)
}

function formateRe(str){
    return str.replace(/\\|\.|\+/g , function(m){return '\\'+m});
}