var http = require('http'),
	requirejs = require('requirejs'),
	atob = require('atob'),
	url = require('url'),
	path = require('path'),
	fs = require('fs-extra'),
	cryp = requirejs('./server/sha.js'),
	util = require('util'),
	port=8484,
	mimeTypes = {
		"xml":"text/xml",
		"tsv":"text/xml",
		"mp4":"video/mp4",
		"webm":"video/webm",
		"svg": "image/svg+xml",
		"html": "text/html",
		"jpeg": "image/jpeg",
		"jpg": "image/jpeg",
		"png": "image/png",
		"js": "text/javascript",
		"css": "text/css"
	},
	encoding={
		"Base64":function(s){
			return atob(s);
		}
	},
	fileOutput = '<html><body>' + '<div><a href="http://localhost:'+port+'/src"</a></div>' + '</body><html>';

http.createServer(
	function(req, res) {    
		if (req.method == 'POST') {
			var body = '',postEnd = '{done:true}';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function () {
				var rec=JSON.parse(body);
				var anErr=function (err) {
					if (err) return console.log(err);
					console.log("POST: "+rec.filename);
				}
				if (rec.md5) {
					rec.req=req;
					cryp.storeFile(rec,function(){});
					if (rec.meta && rec.meta.key) {
						postEnd = JSON.stringify({key:rec.meta.key,md5:rec.meta.md5,done:true});
					}
				} else if (rec.encoding) {
					fs.writeFile(rec.filename, rec.data, rec.encoding, anErr);
				} else {
					fs.writeFile(rec.filename, rec.data, anErr);
				}
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(postEnd);
			});
			return;
		}	
		
		if (res.method == 'GET') {
			var body = '';
			res.on('data', function (data) {
				body += data;
			});
			res.on('end', function () {
				var rec=JSON.parse(body);
				console.log(rec);
			});
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end('get received');
			return;
		}
		if (res && res.method) console.log("+++"+res.method);

		var rec = url.parse(req.url)
		var base=req.headers.host;
		var tmp=req.headers;
		var uri=rec.pathname;
		var filename = path.join(process.cwd(), unescape(uri));
		var stats;
		var end;
		var restEndpoint='/rest/dir/';

		if (uri.indexOf(restEndpoint) == 0) {
			var filename = uri.substring(restEndpoint.length-1,uri.length);
			fs.readdir("."+filename,listFiles);
			function listFiles(err,files) {
				var fileArr=[];
				var ret=[];
				var str="";
				for (var i=0;i<files.length;i++) {
					var stat=fs.lstatSync("."+filename+"/"+files[i]);
					ret.push({path:filename,filename:files[i],size:stat.size,dir:stat.isDirectory()});
				}
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(ret));
				res.end();            
			}
			return;
		}
		var copyEndpoint='/rest/copy/';
		if (uri.indexOf(copyEndpoint) == 0) {
			var filename = path.join(process.cwd(), unescape(uri));
			var stats;
			var queryData = url.parse(req.url, true).query;
			var from=queryData.from?queryData.from:"";
			var to=queryData.to?queryData.to:"";
			var fromFile=path.join(process.cwd(), unescape(from));
			var toFile=path.join(process.cwd(), unescape(to));
			console.log("copy "+fromFile+" "+toFile);
			try {
				fs.createReadStream(fromFile).pipe(fs.createWriteStream(toFile));
			} catch (e) {
				console.log("Copy Caught exception 1 "+fromFile);
			}
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(JSON.stringify({success:true}));
			res.end();            
			return;
		}
		var copyEndpoint='/rest/mkdir/';
		if (uri.indexOf(copyEndpoint) == 0) {
			var filename = path.join(process.cwd(), unescape(uri));
			var queryData = url.parse(req.url, true).query;
			var mkdir=queryData.mkdir?queryData.mkdir:null;
			if (!mkdir) return;
			var mkdir = path.join(process.cwd()+"/CMS", unescape(mkdir));
			try {
				console.log("MKDIR "+mkdir);
				fs.mkdirSync(mkdir);
			} catch (e) {
				console.log("MKDIR Caught exception 2 "+mkdir);
			}
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(JSON.stringify({success:true}));
			res.end();            
			return;
		}
		
		var realFilename=filename;
		if (filename.endsWith(".svg") && filename.indexOf("repo")>-1) {
			filename=filename.substring(0,filename.length-4);
		}

		try {
			stats = fs.lstatSync(filename); // throws if path doesn't exist
		} catch (e) {
			console.log("Caught exception 3 "+filename);
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
			return;
		}

		if (stats.isFile()) {
			// path exists, is a file
			var mimeType = mimeTypes[path.extname(realFilename).split(".").reverse()[0]];
			if (!mimeType) {
				mimeType="text/plain";
			}

			res.writeHead(200, {'Content-Type': mimeType} );

			var fileStream = fs.createReadStream(filename);
			fileStream.pipe(res);
			  
		} else if (stats.isDirectory()) {
			// path exists, is a directory
			res.writeHead(200, {'Content-Type': 'text/html'});
			while (filename.length>0 && ((filename[filename.length-1]=='/') || (filename[filename.length-1]=='\\'))) {
				filename=filename.substring(0,filename.length-1);
			}
			fs.readdir(filename,listFiles);
			function listFiles(err,files) {
				var fileArr=[];
				var ret=[];
				var str="";
				ret.push("<!doctype html><html><head><meta charset=\"utf-8\">" +
						"<meta name=\"viewport\" content=\"width=device-width\"><title>Index of /</title>"+
						"</head><body><h1>Index of /</h1><table>");
				for (var i=0;i<files.length;i++) {
					var stat=fs.lstatSync(filename+"\\"+files[i]);
					fileArr[i]={filename:files[i],stats:stat};
					var sep=base+uri;
					if (sep.length>0 && sep[sep.length-1]!='/') {
						sep=sep+"/";
					}
					str=stat.isDirectory()?"<tr><td><code>(drw-rw-rw-)</code></td><td style=\"text-align: right; padding-left: 1em\"><code>"+
						"</code></td><td style=\"padding-left: 1em\"><a href=\"http://"+sep+files[i]+"\">"+files[i]+"/</a></td></tr>":
						"<tr><td><code>(-rw-rw-rw-)</code></td><td style=\"text-align: right; padding-left: 1em\"><code>10</code></td><td style=\"padding-left: 1em\"><a href=\"http://"+sep+files[i]+
						"\">"+files[i]+"</a></td></tr>";
					ret.push(str);
				}
				ret.push("</table></body></html>");
				str=ret.join(""	);
				res.write(str);
				res.end();
			}
		} else {
			// Symbolic link, other?
			// TODO: follow symlinks?  security?
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.write('500 Internal server error\n');
			res.end();
		}
	}
).listen(port);
console.log('Server running at http://localhost:'+port+'/');