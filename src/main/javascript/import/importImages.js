var fs = require('fs'),
    requirejs = require('requirejs'),
	sha=requirejs("../server/sha.js"),
    XMLdom = new require('xmldom'),
    DOMParser = require('xmldom').DOMParser,
    XMLSerializer=new XMLdom.XMLSerializer(),
    cwd=process.cwd().toLowerCase(),
	path = require('path'),
	iconv = require('iconv-lite'),
	dir={},
	domParser=new DOMParser(),
	document = domParser.parseFromString("<map></map>", "text/xml"),
	out_path_name = "",
	list_of_image_data = [],
	keys={},
	inputFolder=process.argv.length>2?process.argv[2]:"",
	logfile=[],
	idToTopic={},
	imageTypes={},
	repo=process.env.REPO;
	
	
if (!repo) {
	console.log("No environment variable REPO defines");
	return process.exit();
}
	

function getDir(fn) {
    var count=0,ans=[];
    function doDir(d) {
        count++;
        function listFiles(err,files) {
            for (var i=0;i<files.length;i++) {
                var stat=fs.lstatSync(d+path.sep+files[i]);
                if (stat.isDirectory()) {
                    doDir(d+path.sep+files[i]);
                } else {
                    ans.push(d+path.sep+files[i]);
                }
            }
            count--;
            if (count==0) fn(ans);
        }
        fs.readdir(d,listFiles);
    }
    doDir(inputFolder);
}

function log(s) {
	console.log(s);
}

function rootElement(xml) {
	var r=null;
	function traverse(node) {
		if (!node) return;
		if (node.nodeType==1) {
			r=node;
			return;
		}
        var c=node.childNodes;
        if (c&&c.length) {
            for (var i=0;i<c.length;i++) {
                traverse(c[i]);
            }
        }
    }
	traverse(xml);
	return r;
}

function readXmlFiles(list,then) {
    var loaded={};
    var idx=-1;
    function next() {
        idx++;
        if (idx>=list.length) {
            return then(list);
        }
        loaded[list[idx]]=true;
        fs.readFile(list[idx], function (err,data) {			
            if (err || !data) {
                return next();
            }
            var filename=list[idx],
				rec=dir[filename];
            if (!rec) {
                rec=dir[filename]={};
            }
            rec.type="other";
			if (data.length>6 && data[0]==0xFE && data[1]==0xFF && data[2]==0x00 && data[3]=='<'.charCodeAt(0) && data[4]==0x00 && data[5]=='?'.charCodeAt(0)) {
                var str = iconv.decode(data, "UTF-16BE");
			} else {
				var str = data.toString();
			}
            rec.dom = new DOMParser();
            rec.xml = rec.dom.parseFromString(str);
			rec.location=filename;
			rec.root=rootElement(rec.xml);
			if (rec.root.nodeName=="imagemeta") {
				console.log(list[idx]);
			}
			rec.rootId=rec.root.getAttribute("id");
			idToTopic[rec.rootId]=rec;
			rec.type=rec.root?rec.root.nodeName:"other";
            if (rec.type=="bookmap") {
                rec.paths = list;
                rec.title = rec.xml.getElementsByTagName("mainbooktitle")[0].textContent;
			} else {
				var text=rec.xml.getElementsByTagName("title");
				if (text && text.length) {
					rec.title = text[0].textContent;
				}
			}
			filesParts(rec,list[idx]);
            return next();
        });
    }
    next();
}

function filesParts(rec,p) {
	var baseName=p.split(path.sep);
	rec.fileName=baseName.pop();
	rec.path=baseName.join(path.sep);
	baseName=rec.fileName.split(".");
	rec.fileType=baseName.pop();
	rec.fName=baseName.join(".");
}

getDir(thenReadXmlFiles);

function thenReadXmlFiles(list) {
	 var accept={"indexedcontent":true};
     var xmls=[];
     for (var i=0;i<list.length;i++) {
		 if (list[i].endsWith(".image")) {
			 var frec={};
			 filesParts(frec,list[i]);
			 var file=frec.path+path.sep+frec.fName+".indexedcontent";
			 dir[file]={};
			 filesParts(dir[file],file);
			 xmls.push(file);
		 }
     }
     readXmlFiles(xmls, function(){
			checkFiles();
			console.log(JSON.stringify(imageTypes));
			console.log("OK");
		 });//,thenReportDone);
}

function writeFile(rec) {
	rec.data="a";
}

function test(rec) {
	var xml=rec.xml,done=false;
	function traverse(node) {
		if (done) return;
		var c=node.childNodes;
		if (node.nodeType==1 && node.nodeName=="mime-type") {
			if (node.parentNode.nodeName=="imageinfo") {
				imageTypes[node.textContent]=true;
				rec.meta=rec.meta?rec.meta:{};
				rec.meta.encoding="binary";
				rec.meta.image=node.textContent;
				rec.meta.filename=rec.fName;
				writeFile(rec);
				rec.data=fs.readFileSync(rec.path+path.sep+rec.fName+".image","binary");
				done=true;
			}
		}
		if (c&&c.length) {
			for (var i=0;i<c.length;i++) {
				traverse(c[i]);
			}
		}
	}	
	traverse(xml);
}
function checkFiles() {
	var data=fs.readFileSync("..\\repo\\repo.map", "binary"),
	list=[],count=-1;
	keys=JSON.parse(""+data);

	for (var i in dir) {
		list.push(dir[i]);
	}
	function next() {
		count++;
		if (count>=list.length) return finished();
		var rec=list[count];
		test(rec);
		
		if (rec.data) {
			sha.storeFile(rec,next);
		} else {
			return next();
		}
	}
	function finished() {
		for (var i=0;i<list.length;i++) {
			if (list[i].meta.md5=="1497f9b76483f9c1354894e04631df0d") {
				console.log("");
			}
			keys[list[i].meta.md5]=list[i].meta.key;
		}
		fs.writeFileSync("..\\repo\\repo.map",JSON.stringify(keys) , "binary");
	}
	next();
}

