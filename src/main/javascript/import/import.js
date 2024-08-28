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
	db={},
	domParser=new DOMParser(),
	document = domParser.parseFromString("<map></map>", "text/xml"),
	keys={},
	inputFolder=process.argv.length>2?process.argv[2]:"",
	logfile=[],
	idToTopic={},
	repo=process.env.REPO;
	
	
if (!repo) {
	console.log("No environment variable REPO defines");
	return process.exit();
}
	
getDir(thenReadXmlFiles);

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
            if (count==0) {
				db["files"]=ans;
				fn(ans);
			}
        }
        fs.readdir(d,listFiles);
    }
    doDir(inputFolder);
}

function thenReadXmlFiles(list)
 {
	 var accept={"dita":true,"xml":true,"ditamap":true,"indexedcontent":true /* ,"customproperties":true,"properties":true */};
     var xmls=[];
     for (var i=0;i<list.length;i++)
     {
		 var frec={};
		 filesParts(frec,list[i]);
         if (accept[frec.fileType]) {
             xmls.push(list[i]);
         }
     }
     readXmlFiles(xmls, function(){
			processFiles(list);
			processKeys();
			console.log("OK");
		 });//,thenReportDone);
}

function filesParts(rec,p) {
	var baseName=p.split(path.sep);
	rec.fileName=baseName.pop();
	rec.path=baseName.join(path.sep);
	baseName=rec.fileName.split(".");
	rec.fileType=baseName.pop();
	rec.fName=baseName.join(".");
}

function traverseXml(xml,start,end) {
	function children(node) {
		var n=node.nodeType,c=[];
		if (n==3) return c;
		if (n==1) {
			var cn=node.childNodes;
			for (var i=0;i<cn.length;i++) {
				c.push(cn[i]);
			}
			return c;
		}
		if (n>3) {
			if (node.firstChild) {
				return [node.firstChild];
			}
		}
		return c;
	}
	function traverse(node) 
	{
		var c=children(node);
		if (start) {
			start(node);
		}
		for (var i=0;i<c.length;i++) {
			traverse(c[i]);
		}
		if (end && node.nodeType==1) {
			end(node);
		}
	}
	traverse(xml);
}

function processFiles(list) {
	var references=[],
	ids={},
	referenced={};
	function logIds(rec) {
		rec.topic=true;
		var logged=false;
		traverseXml(rec.xml,(node)=>{
			if (node.nodeType==1) {	 
				 if (n=node.getAttribute("id"))  {
					 rec.ids=rec.ids?rec.ids:{};
					 rec.ids[n]=node;
				 }
				 if (n=node.getAttribute("conkeyref"))  {
					 rec.conkeyrefs=rec.conkeyrefs?rec.conkeyrefs:{};
					 rec.conkeyrefs[n]=node;
				 }
				 if (n=node.getAttribute("keyref"))  {
					 rec.keyrefs=rec.keyrefs?rec.keyrefs:{};
					 rec.keyrefs[n]=node;
				 }
				 if (n=node.getAttribute("href"))  {
					 rec.hrefs=rec.hrefs?rec.hrefs:{};
					 rec.hrefs[n]=node;
				 }
			 }
		});
	}
	function image(rec,f) {
		rec.image=true;
		rec.file=f;
		console.log("---"+f);
		var logged=false;
		traverseXml(rec.xml,(node)=>{
			 if (node.nodeType==1) {				 
                 if (node.nodeName=="mime-type" && node.parentNode.nodeName=="imageinfo") {
					 rec.mime=node.textContent;
				 }
			 }
		 });
	}
	for (var i=0;i<list.length;i++) {
		if (list[i].endsWith(".dita")) {
			logIds(dir[list[i]]);
		}
		if (list[i].endsWith(".image")) {
			var img=list[i].split(".");
			img.pop();			
			image(dir[img.join(".")+".indexedcontent"],list[i]);
		}
		if (list[i].endsWith(".ditamap")) {
			checkBookmap(dir[list[i]]);
		}
	}
}	


function log(s) {
	console.log(s);
}

function findNodeType(xml,type) {
	var returnNode=null;
     function traverse(node) {
		 if (returnNode) return;
         if (node.nodeType==type) {
			 returnNode=node;
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
	 return returnNode;
}

function arr(s) {
	var r=[];
	for (var i=0;i<s.length;i++) {
		r.push(s[i]);
	}
	return r;
}

function getKey(stack,key) {
	var k=key,keys,r;
	for (var i=stack.length-1;i>=0;i--) {
		keys=stack[i].keys;
		var r=keys[k];
		if (r) return r;
	}
	return null;
}

function getHref(stack,key) {
	var k=key,r,h;
	while (r=getKey(stack,k)) {
		if (r) {
			if (h=r.getAttribute("href")) {
				return h;
			} 
			k=r.getAttribute("keyref");
			if (k) continue;
			return null;
		}		
	}
	return null;
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
            return next();
        });
    }
    next();
}

function processKeys() {
	var repoMap={},requests=0,acks=0;
	var list=[];
	
	function doStore(rec) {
		requests++;
		function done(err,r) {
			repoMap[r.meta.md5]=r.meta.key;
			acks++;
			if (acks==requests) {
				fs.writeFile(repo+path.sep+"repo.map", JSON.stringify(repoMap), "binary", function(p){console.log("Done");});
			}
		}
		sha.storeFile(rec,done)
	}
	
	for (var i in keys) {
		var key=keys[i].getAttribute("href");
		if (!key) {
//			console.log("No key for "+i);
			continue;
		}
		var meta=null;
		var file=inputFolder+path.sep+key;
		var rec=dir[file];
		if (!rec) {
//			console.log("No rec for key:"+i+" href:"+key+" file:"+file);
			continue;
		}
		list.push(key);
		var meta=rec.meta=rec.meta?rec.meta:{};
		meta["keyCMS"]=i;
		meta["filename"]=i;
		meta["title"]=rec.title;
		if (rec.xml) {
			meta["encoding"]="utf8";
		}
	}
	for (var i=0;i<list.length;i++) {
		var key=list[i];
		var file=inputFolder+path.sep+key;
		var rec=dir[file];
		if (rec) {
			if (rec.xml) {
				changeKeyrefs(rec);
				var newrec={data:XMLSerializer.serializeToString(rec.xml),meta:rec.meta};
				doStore(newrec);
			} else {
				fs.readFile(inputFolder+path.sep+key, function (err,data) {
					var newrec={data:data,meta:rec.meta};
					doStore(newrec);
				});
			}
		} else {
			console.log("No rec for "+file);
		}
	}
}

function safeRemoveAtt(node,att) {
	if (node.hasAttribute(att)) {
		node.removeAttribute(att);
	}
}

function remove(b) {
	return (b && b.parentNode)? b.parentNode.removeChild(b):null;
}

function fileOnPath(fullpath,newfile) {
	var file=fullpath.split(path.sep);
	file.pop();
	file.push(newfile);
	return file.join(path.sep);
}

function checkBookmap(rec) {
	var fileList={},
		currentScope,
		scopeList=[],
		scopeStack=[];

	if (!rec.xml) return;

	scopeList[scopeList.length]=currentScope={"scope":null,node:rec.xml,index:scopeList.length,keys:{},scopes:[]};
	scopeStack.push(currentScope);
	
	return internalMap(rec);

	function internalMap(rec) {

		
		var nodeHandler={
			"topicref":function(context,node){
					var keyref=node.getAttribute("keyref");
					rec.keyrefs=rec.keyrefs?rec.keyrefs:[];
					rec.keyrefs.push(node);
					fileList["keyref"]=true;
				},
			"chapter":function(context,node){
					var keyref=node.getAttribute("keyref");
					fileList["keyref"]=true;
				},
			"keydef":function(context,node){
					var keys=node.getAttribute("keys").split(" ");
					
					for (var i=0;i<keys.length;i++) {
						if (currentScope.keys[keys[i]]) {
							console.log(keys[i]+" Already defined");
						} else {
							log(keys[i]);
							currentScope.keys[keys[i]]=node;
						}
					}
				},
			"mapref":function(context,node){
					var kref;
					if (kref=node.getAttribute("keyref")) {
						var href=getHref(scopeStack,kref);
					} else {
						var href=node.getAttribute("href");
					}
					var newfile=fileOnPath(rec.location,href)
					internalMap(dir[newfile]);
				}
			};

		var nodeAttributeHandler={
			"keyscope":function(context,node){
				var name=node.getAttribute("keyscope");
				context.scopeKey=node;
				scopeStack.push(scopeList[scopeList.length]=currentScope={"scope":name,node:node,index:scopeList.length,keys:{},scopes:[]});
				for (var i=0;i<scopeStack.length;i++) {
					currentScope.scopes[i]=scopeStack[i].index;
				}
			},
			"conkeyref":function(context,node){
				var name=node.getAttribute("conkeyref");
				context.scopeKey=node;
				scopeStack.push(scopeList[scopeList.length]=currentScope={"scope":name,node:node,index:scopeList.length,keys:{},scopes:[]});
				for (var i=0;i<scopeStack.length;i++) {
					currentScope.scopes[i]=scopeStack[i].index;
				}
			}
		}

		
		function traverse(node) {
			var c=node.childNodes,
			context={scopeKey:null};
			//  console.log(node.nodeName)
			if (node.nodeType==1) {
				var atts=node.attributes;
				for (var i=0;i<atts.length;i++) {
					if (nodeAttributeHandler[atts[i].name]) {
						nodeAttributeHandler(context,node);
					}
				}
			}
			if (nodeHandler[node.nodeName]) {
				nodeHandler[node.nodeName](context,node);
			}
			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					traverse(c[i]);
				}
			}
			if (context.scopeKey) {
				scopeStack.pop();
				currentScope=scopeStack.pop();
				scopeStack.push(currentScope);
			}
		}
		traverse(rec.xml);
	}
}

function changeKeyrefs(rec) {
	if (!rec.xml) return;
	
	var firstNode=null;
	rec.keydefNodes=[];

	function keyref(node,att) {
		var value=node.getAttribute(att);
		if (!value) return;
		var parts=value.split("/");
		if (keys[parts[0]]) {
			parts[0]=sha.genMd5(parts[0]);
			node.setAttribute(att,parts.join("/"));
		}
	}

	function keydefKeys(node,att) {
		if (node.nodeName!="keydef") return;
		if (node.getAttribute("xtrc")!="ixiasoft.drm.remove") return;
		var value=node.getAttribute(att);
		if (!value) return;
		if (keys[value]) {
			rec.keydefNodes.push(node);
		}
	}

	function traverse(node) {
		var c=node.childNodes;
		//  console.log(node.nodeName)
		if (node.nodeType==1 && node.attributes.length) {
			if (!firstNode) {
				firstNode=node;
				var id=node.getAttribute("id");
				node.setAttribute("id",sha.genMd5(id));
				rec.newId=node.getAttribute("id");
			}
			keyref(node,"keyref");
			keyref(node,"conkeyref");
			keydefKeys(node,"keys");
		}
		if (c&&c.length) {
			for (var i=0;i<c.length;i++) {
				traverse(c[i]);
			}
		}
	}
	traverse(rec.xml);
	if (rec.keydefNodes.length) {
		for (var i=0;i<rec.keydefNodes.length;i++) {
			var p=rec.keydefNodes[i];
			p.parentNode.removeChild(p);
		}
	}
}

/*
    <booklists>         
      <bibliolist keyref="xje1548848851319"/>
	</booklists>
	*/
function eachChild(node,fn) {
	var p=node.childNodes;
	if (!p) return;
	for (var i=0;i<p.length;i++) {
		fn(p.childNodes[i]);
	}
}
