var tobase64 = require('../');
var vfs = require('vinyl-fs');
var assert = require('assert');

describe('/test/test.js', function(){
  it('should run without error when ignore is array', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:['img_2.png'],
        pathrep:{
          reg:/\/public\//g
        }
      }))
      .pipe(vfs.dest(__dirname + '/dist/test1'))
      .on('end', function(){
        done();
      });
  });

  it('should run without error when ignore is string', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:'img_2.png',
        pathrep:{
          reg:/\/public\//g ,
          rep:'./ref/'
        }
      }))
      .pipe(vfs.dest(__dirname + '/dist/test2'))
      .on('end', function(){
        done();
      });
  });

  it('should run without error when ignore is regexp', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64({
        ignore:/img_2\.png/g
      }))
      .pipe(vfs.dest(__dirname + '/dist/test3'))
      .on('end', function(){
        done();
      });
  });

  it('should run without error when no arguments', function(done){
    vfs.src([__dirname + '/ref/test.html' , __dirname + '/ref/css/test.css'])
      .pipe(tobase64())
      .pipe(vfs.dest(__dirname + '/dist/'))
      .on('end', function(){
        done();
      });
  });
});