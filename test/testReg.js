//简易url正则测试
var fs = require("fs");

var html = fs.readFileSync("regTest.html").toString();

var URL_REG = /(?:"|'|\()(?:\/?([\w.-]|\.|\.\.)*\/)*?[\w-]*?\.(?:png|jpg|gif|bmp)(?:\?[\w=]*)?(?:"|'|\))/g;

console.log(html.match(URL_REG).join("\n"));