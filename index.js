'use strict';

var through = require('through2');
var path = require('path');
var fs = require('fs');
var URL_REG = /("|'|\()((?:\/?(?:[\w.-]|\.|\.\.)*\/)*?[\w-]*?\.(png|jpg|gif|bmp))(?:\?[\w=]*)?("|'|\))/g;

/**
 * @param opt
 *  - log     {Boolean}  whether output log, default is true
 *  - maxsize {Number}   max size of img should be handling, unit is kb
 *  - ignore  {RegExp|Array|String}  ignore file name
 *  - pathrep {Object}   url mapping
 *      - reg   {RegExp|String}  regexp
 *      - rep   {String}         string need to replace
 */
module.exports = function(opt) {
  opt = opt || {};
  var ignore = opt.ignore;
  var maxsize = +opt.maxsize || 1;
  var pathrep = opt.pathrep || {};

  // transform ignore list to regexp
  var type = Object.prototype.toString.call(ignore);
  var igReg;
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
   * transform of stream
   * @param file
   * @param encoding
   * @param done
   * @private
   */
  var _transform = function(file, encoding, done) {
    var str = String(file.contents);
    var p = file.path.substring(0, file.path.lastIndexOf(path.sep));

    str = str.replace(URL_REG, function(m, p1, p2, p3, p4) {
      var prefix = p1;       // src start ', " or (
      var suffix = p4;       // src end
      var imgkind = p3;      // image type
      var imgPath = p2;      // image path

      // ignore file
      if (igReg && m.match(igReg)) {
        return m;
      }

      // replace file path by regexp
      if (pathrep && (pathrep.reg instanceof RegExp) && m.match(pathrep.reg)) {
        imgPath = imgPath.replace(pathrep.reg, pathrep.rep || '');
      } else {
        imgPath = path.resolve(p, imgPath);
      }

      if (fs.existsSync(imgPath) && (fs.statSync(imgPath).size / 1024) < maxsize) {
        var source = fs.readFileSync(imgPath).toString('base64');
        var imageSource = 'data:image/' + imgkind + ';base64,' + source;
        return prefix + imageSource + suffix;
      }

      return m;
    });

    file.contents = new Buffer(str);

    done(null, file);
  };

  function formatReg(str) {
    return str.replace(/\\|\.|\+/g, function(m) {
      return '\\' + m
    });
  }

  return through.obj(_transform)
};
