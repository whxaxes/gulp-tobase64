'use strict';
const through = require('through2');
const path = require('path');
const fs = require('fs');
const URL_REG = /("|'|\()((?:\/?(?:[\w.-]|\.|\.\.)*\/)*?[\w-]*?\.(png|jpg|gif|bmp))(?:\?[\w=]*)?("|'|\))/g;

/**
 * @param opt
 *  - log     {Boolean}  是否输出log, 默认值为1
 *  - maxsize {Number}   小于该值的图片将会被编译为base64，单位为kb
 *  - ignore  {RegExp|Array|String} 用于过滤部分不想编译的图片名
 *  - pathrep {Object}   将路由地址的图片路径替换成相对地址,格式为{reg:'',rep:''}
 *      - reg   {RegExp|String}  用于匹配替换的正则
 *      - rep   {String}         替换字符
 */
module.exports = function(opt) {
  opt = opt || {};
  let ignore = opt.ignore;
  let maxsize = +opt.maxsize || 1;
  let pathrep = opt.pathrep || {};

  //将ignore参数转成正则
  const type = Object.prototype.toString.call(ignore);
  let igReg;
  if (type === '[object Array]') {
    igReg = new RegExp(formatReg(ignore.join('|')), 'g');
  } else if (type === '[object String]') {
    igReg = new RegExp(formatReg(ignore), 'g');
  } else if (type === '[object RegExp]') {
    igReg = ignore;
  } else {
    igReg = null;
  }

  /**
   * 流的中转方法
   * @param file
   * @param encoding
   * @param done
   * @private
   */
  const _transform = function(file, encoding, done) {
    let str = String(file.contents);
    let p = file.path.substring(0, file.path.lastIndexOf(path.sep));

    str = str.replace(URL_REG, function(m) {
      let prefix = RegExp.$1;       //$1为匹配的开头的'或'或(
      let suffix = RegExp.$4;       //$4为匹配的结尾的'或'或)
      let imgkind = RegExp.$3;      //$3为匹配的图片类型
      let imgPath = RegExp.$2;      //$2为路径内容

      //判断ignore的值并进行相应处理
      if (igReg && m.match(igReg)) return m;

      //如果是路由地址，则替换为相对地址，否则根据文件位置匹配出相应的绝对地址
      if (pathrep && (pathrep.reg instanceof RegExp) && m.match(pathrep.reg)) {
        imgPath = imgPath.replace(pathrep.reg, pathrep.rep || '');
      } else {
        imgPath = path.resolve(p, imgPath);
      }

      //如果图片文件小于1kb则替换为base64格式
      if (fs.existsSync(imgPath) && (fs.statSync(imgPath).size / 1024) < maxsize) {
        let source = fs.readFileSync(imgPath).toString('base64');
        let imageSource = `data:image/${imgkind};base64,${source}`;
        return `${prefix}${imageSource}${suffix}`;
      }

      return m;
    });

    file.contents = new Buffer(str);

    done(null, file);
  };

  function formatReg(str) {
    return str.replace(/\\|\.|\+/g, m => '\\' + m);
  }

  return through.obj(_transform)
};
