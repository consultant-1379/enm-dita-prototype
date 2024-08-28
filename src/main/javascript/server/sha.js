define(function(){
	
    const crypto = require('crypto'),
	fs = require('fs'),
	path=require("path");
	var repo=process.env.REPO;
	repo=repo?repo:"repo";

	function genSha1(data) {
		return crypto.createHash('sha1').update(data).digest('hex');
	}
	function genMd5(data) {
		return crypto.createHash('md5').update(data).digest('hex');
	}
	function dirFile(file) {
		return repo+path.sep+file.substring(0,3)+path.sep+file.substring(3);
	}
	function checkMeta(rec) {
		var key=genSha1(rec.data),
		meta=rec.meta=rec.meta?rec.meta:{};
		
		if (meta["key"]==key) return meta["changed"]=false;
		meta["changed"]=true;
		meta["approved"]=false;
		meta["encoding"]=meta["encoding"]?meta["encoding"]:"utf8";
		meta["key"]=key;
		
		if (meta["filename"]&&!meta["md5"]) {
			meta["md5"]=genMd5(meta["filename"]);
		}
	}
	function logError(err) {
		if (err) {
			console.log(JSON.stringify(err));
		}
	}
	function dupMeta(a) {
		var b={key:a.key,time:Date.now()};
		return b;
	}
	
	function storeFile(rec,fn) {
		checkMeta(rec);
		var fnList=[],
		idx=0,
		meta=rec.meta;
		if (!meta.changed) {
			return fn(null,rec);
		}

		fnList.push(function() {
			//mkdir md5
			var next=fnList[++idx];
			fs.mkdir(repo+path.sep+meta.md5.substring(0,3),next);
		});
		fnList.push(function(err) {
			//check id md5 exists
			if (err && err.code != 'EEXIST') {
				logError(err);
			}
			var next=fnList[++idx];
			fs.stat(repo+path.sep+meta.md5.substring(0,3)+path.sep+meta.md5.substring(3),next);
		});
		fnList.push(function(err,stats) {
			var next=fnList[++idx];
			if (stats && stats.isFile()) {
				fs.readFile(repo+path.sep+meta.md5.substring(0,3)+path.sep+meta.md5.substring(3),next);
			} else {
				meta.history=[];
				meta.history.push(dupMeta(meta));
				next=fnList[++idx];
				return next();
			}
		});
		fnList.push(function(err,data) {
			var next=fnList[++idx],
			currentMeta=JSON.parse(data),
			dup=dupMeta(meta);
			currentMeta.history=currentMeta.history?currentMeta.history:[];
			currentMeta.history.push(dup);
			meta.history=currentMeta.history;
			for (var i in currentMeta) {
				if (!meta[i]) {
					meta[i]=currentMeta[i];
				}
			}
			return next();
		});
		fnList.push(function(err) {
			//mkdir sha1
			if (err && err.code != 'EEXIST') {
				logError(err);
			}
			var next=fnList[++idx];
			fs.mkdir(repo+path.sep+meta.key.substring(0,3),next);
		});
		fnList.push(function(err) { 
			//write metadata
			if (err && err.code != 'EEXIST') {
				logError(err);
			}
			var next=fnList[++idx];
			fs.writeFile(repo+path.sep+meta.md5.substring(0,3)+path.sep+meta.md5.substring(3), JSON.stringify(meta), "utf8", next);
		});
		fnList.push(function(err) {
			//write file
			if (err) {
				logError(err);
			}
			var next=fnList[++idx];
			fs.writeFile(repo+path.sep+meta.key.substring(0,3)+path.sep+meta.key.substring(3), rec.data, meta.encoding, next);
		});
		fnList.push(function(err) {
			if (err) {
				logError(err);
			}
			return fn(err,rec);
		});
		fnList[0]();
	}
	console.log("loaded");
	return {storeFile:storeFile, checkMeta:checkMeta, genSha1:genSha1, genMd5:genMd5}
	
});