var tobase64 = require('../');
var vfs = require('vinyl-fs');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var fs = require('fs');

describe('/test/test.js', function(){
  it('should run without error when ignore is array and size limit is 1KB', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:['img_2.png'],
        pathrep:{
          reg:/\/public\//g
        }
      }))
      .pipe(vfs.dest(__dirname + '/dist/test1'))
      .on('end', function(){
        var matcher = getMatcher('test1');
        expect(matcher[0]).to.not.equals('img_1.png');
        expect(matcher).to.have.lengthOf(4);
        done();
      });
  });

  it('should run without error when ignore is string and size limit is 2KB', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:'img_2.png',
        maxsize: 2,
        pathrep:{
          reg:/\/public\//g,
          rep:'./test/ref/'
        }
      }))
      .pipe(vfs.dest(__dirname + '/dist/test2'))
      .on('end', function(){
        var matcher = getMatcher('test2');
        expect(matcher).to.not.include('img_1.png', 'img_3.png');
        done();
      });
  });

  it('should run without error when ignore is regexp and no pathrep', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:/img_1\.png/g
      }))
      .pipe(vfs.dest(__dirname + '/dist/test3'))
      .on('end', function(){
        var matcher = getMatcher('test3');
        expect(matcher).to.not.include('img_2.png');
        expect(matcher).to.have.lengthOf(4);
        done();
      });
  });

  it('should run without error when no arguments', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64())
      .pipe(vfs.dest(__dirname + '/dist/test4'))
      .on('end', function(){
        var matcher = getMatcher('test4');
        expect(matcher).to.not.include('img_2.png');
        expect(matcher[0]).to.not.equals('img_1.png');
        expect(matcher).to.have.lengthOf(3);
        done();
      });
  });
});

function getMatcher(dir){
  return fs.readFileSync(__dirname + '/dist/'+dir+'/test.html')
    .toString()
    .match(/img_\d\.png/g)
}