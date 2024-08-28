var requirejs = require('requirejs'),
    filesys=requirejs("./sha");
 filesys.storeFile({data:"abcdefg",meta:{filename:"/abc/def/ghij.txt",encoding:"utf8"}},(err,rec)=>{console.log(JSON.stringify(rec))});
