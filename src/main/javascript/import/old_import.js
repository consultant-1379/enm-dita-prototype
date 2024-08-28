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

function getKeyDirect(stack,key) {
	for (var i=stack.length-1;i>=0;i--) {
		if (stack[i].keys[key]) {
			return stack[i].keys[key];
		}
	}
	if (keys[key]) {
		return keys[key]; 
	}
	return null;
}

function getKey(stack,key) {
	var k=key;
	while (k) {
		k=getKeyDirect(stack,k);
		if (!k) return k;
		if (k.hasAttribute("keyref")) {
			k=k.getAttribute("keyref");
			continue;
		}
		return k;
	}
	return null;
}

function processContainer(xml) {
     function traverse(node) 
     {
         var c=node.childNodes;
       //  console.log(node.nodeName)
         if (node.nodeName=="keydef" && node.parentNode && node.parentNode.nodeName=="topicgroup") {
			 var allKeys=node.getAttribute("keys");
			 if (allKeys) {
				 allKeys=allKeys.split(" ");
				 for (var i = 0; i<allKeys.length;i++) {
					 var key=allKeys[i];
					 if (keys[key]) {
						 if (keys[key].getAttribute("keyref")!=node.getAttribute("keyref")) {
							 log("Key "+key+" already defined");
						 }
					 } else {
						 keys[key]=node;
					 }
				 }
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

function filesParts(rec,p) {
	var baseName=p.split(path.sep);
	rec.fileName=baseName.pop();
	rec.path=baseName.join(path.sep);
	baseName=rec.fileName.split(".");
	rec.fileType=baseName.pop();
	rec.fName=baseName.join(".");
}

function containerFiles() {
	var rec,tmp,links={"customproperties":true,"indexedcontent":true,"properties":true};
	for (var file in dir) {
		rec=dir[file];
		if (rec.type=="containerpart") {
			processContainer(rec.xml);
		}
	}
}

getDir(thenReadXmlFiles);
function thenReadXmlFiles(list)
 {
	 var accept={"dita":true,"xml":true,"ditamap":true,"customproperties":true,"indexedcontent":true,"properties":true};
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
			containerFiles();
			processFiles(list);
			processKeys();
			console.log("OK");
		 });//,thenReportDone);
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
	var scopeStack=[],
		scopeList=[],
		fileList={},
		currentScope;
	
	if (!rec.xml) return;
	scopeList[scopeList.length]=currentScope={"scope":null,node:rec.xml,index:scopeList.length,keys:{},scopes:[]};
	function fileForHrefKeyref(context,node) {
		if (node.hasAttribute("keyref")) {
			var kref=node.getAttribute("keyref"),noderef=getKey([],kref),href=noderef.getAttribute("href");
		} else {
			var href=node.getAttribute("href");
		}
		return fileOnPath(rec.location,href)
	}
	
	var nodeHandler={
		"topicref":function(context,node){
				var keyref=node.getAttribute("keyref");
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
				if (node.hasAttribute("keyref")) {
					var kref=node.getAttribute("keyref"),noderef=getKey([],kref),href=noderef.getAttribute("href");
				} else {
					var href=node.getAttribute("href");
				}
				var newfile=fileOnPath(rec.location,href)
				checkBookmap(dir[newfile]);
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

function changeKeyrefs(rec) {
	if (!rec.xml) return;
	var firstNode=null;
	function keyref(node,att) {
		var value=node.getAttribute(att);
		if (!value) return;
		var parts=value.split("/");
		if (keys[parts[0]]) {
			parts[0]=sha.genMd5(parts[0]);
			node.setAttribute(att,parts.join("/"));
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
			}
			keyref(node,"keyref");
			keyref(node,"conkeyref");
		}
		if (c&&c.length) {
			for (var i=0;i<c.length;i++) {
				traverse(c[i]);
			}
		}
	}
	traverse(rec.xml);
}




/*
    <booklists>         
      <bibliolist keyref="xje1548848851319"/>
	</booklists>
	*/

function processFiles(list) {
	var references=[],
	ids={},
	referenced={};
	function logIds(rec) {
		var logged=false;
		 function traverse(node) 
		 {
			 var c=node.childNodes;
			 if (c&&c.length) {
				 for (var i=0;i<c.length;i++) {
					 traverse(c[i]);
				 }
			 }
		 }
		 traverse(rec.xml);
	}
	for (var i=0;i<list.length;i++) {
		if (list[i].endsWith(".dita")) {
			logIds(dir[list[i]]);
		}
		if (list[i].endsWith(".ditamap")) {
			checkBookmap(dir[list[i]]);
		}
	}
	console.log(logfile.join("\r\n"));
}	

function createMap(xml) {
     var map=document.createElement("map");
     function traverse(node,parent) 
     {
         var c=node.childNodes;
        //  console.log(node.nodeName)
         if (node.nodeName=="chapter" || node.nodeName=="topicref") 
         {
             if(node.nodeName=="chapter") 
             {
                 var newNode=document.createElement("topicref");
             }
             else 
             {
                 var newNode=document.createElement("topicref");
             }
             parent.appendChild(newNode);
             parent=newNode;
             var atts=node.attributes;
             if (atts) {
                 for (var i=0;i<atts.length;i++) {
                     var name=atts[i].name;
                     if (name=="keyref") {
                         newNode.setAttribute("href",atts[i].value+".xml");
                     } else {
                         newNode.setAttribute(atts[i].name,atts[i].value);
                     }
                 }
             }
         }
         if (c&&c.length) {
             for (var i=0;i<c.length;i++) {
                 traverse(c[i],parent);
             }
         }
     }
     traverse(xml,map);
     return map;
}

