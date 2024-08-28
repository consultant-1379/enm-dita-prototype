define(["DomStuff","keys","directory"],function(domStuff,keys,dir){

	var nodes=[],elementCount=0,directory=dir.directory;

	function load(key,xml) {
		var conkeyrefs={},
		    rec=directory[key]={id:key,xml:xml,conrefs:conkeyrefs,start:elementCount},
			rootElement=rootNode(xml),
			rootId=rootElement.getAttribute("id");
		function traverse(node) {
			var c=node.children;
			if (node.nodeType==1) {
				++elementCount;
				node.setAttribute("eCount",elementCount);
				nodes[elementCount]=node;
				var id=node.getAttribute("id");
				var conkeyref=node.getAttribute("conkeyref");
				if (conkeyref) {
					conkeyrefs[elementCount]={node:node};
				}
				if (id) {
					directory[key+"/"+id]={xml:node};
				}
			}
			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					traverse(c[i]);
				}
			}
		}
		if (rootElement&&rootElement.nodeName=="repomap") {
			dir.repomaps[key]=rootElement;
		}
		traverse(xml);
		rec.end=elementCount;
		return;
	}

	function clone(xml) {
		var str=domStuff.serializer.serializeToString(xml);
		return domStuff.domParser.parseFromString(str, "text/xml");
	}

	function countObject(obj) {
		var count=0;
		for (var i in obj) {
			count++;
		}
		return count;
	}

	function rootNode(node) {
		if (node.nodeType==9) return node.firstChild;
		return node;
	}

	function getCompleteXml(kref,scopeIdx,endFn) {
		var count=0,mainXml=null;
		function get(rec) {
			count++;
			function store(xml) {
				var node=null;
				if (!rec.node) {
					var k=keys.getKey(rec.scopeIdx,rec.key),r=null;
					if (k && (f=k.getAttribute("href")) && (r=directory[f]) && countObject(r.conrefs)==0) {
						return endFn(xml);
					}
					mainXml=node=clone(xml);
				} else {
					node=rootNode(clone(xml));
					var target=rec.node,ref=target.getAttribute("conkeyref");
					if (ref) {
						node.setAttribute("_rcref",ref);
						node.setAttribute("_eref",target.getAttribute("eCount"));
						if (target.hasAttribute("id")) {
							if (node.hasAttribute("id")) {
								node.setAttribute("_origid",node.getAttribute("id"));
							}
							node.setAttribute("id",target.getAttribute("id"));
						}
					}
					target.parentNode.replaceChild(node,target);
				}
				var toGet=[];
				function traverse(node) {
					var c=node.children;
					if (node.nodeType==1) {
						var conkeyref=node.getAttribute("conkeyref");
						if (conkeyref) {
							toGet.push({key:conkeyref,scopeIdx:scopeIdx,node:node});
						}
					}
					if (c&&c.length) {
						for (var i=0;i<c.length;i++) {
							traverse(c[i]);
						}
					}
				}
				traverse(node);
				for (var i=0;i<toGet.length;i++) {
					get(toGet[i]);
				}
				count--;
				if (count==0) endFn(mainXml);
			}
			getXmlKey(rec.key,rec.scopeIdx,store);
		}
		get({key:kref,scopeIdx:scopeIdx,node:null})

	}

	function getXmlKey(kref,scopeIdx,endFn) {
		function makeReturn(param) {
			endFn(param);
		}
		function internal(keyref,scopeIndex) {
			function innerGetKeys(str) {
				if (directory[str]) return makeReturn(directory[str].xml);
				var keyrefs=str.split("/");
				var file=keyrefs[0];
				if (directory[file]) return makeReturn(null);
				function getId(xml) {
					if (directory[str]) return makeReturn(directory[str].xml);
					return makeReturn(null);
				}
				getXmlFile(file,getId);
			}
			var keyrefs=keyref.split("/");
			var ref=keys.getKey(scopeIndex,keyrefs[0]);
			if (ref) {
				var href=ref.getAttribute("href");
				keyrefs[0]=href;
				return innerGetKeys(keyrefs.join("/"));
			}
			return makeReturn(null);
		}
		internal(kref,scopeIdx)
	}

	function getDir() {
		return directory;
	}

	function getXmlFile(key,fn) {
		var dir=directory[key],
			xml=dir?dir.xml:null;
		if (xml) return fn(xml);
		function toXml(data) {
			var xml=domStuff.loadXML(data);
			load(key,xml);
			fn(xml);
		}
		var str="/repo/"+toKey(key);
		ajax(str,toXml);
	}
	function toKey(key) {
		return key.substring(0,3)+"/"+key.substring(3);
	}
	function getFile(key,fn) {
		var str="/repo/"+toKey(key);
		ajax(str,fn);
	}
	function ajax(page, fn) {
		var http = new XMLHttpRequest();
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				fn(http.response);
			}
		}
		http.open("GET", page);
		http.send();
	}
	function ajaxPost(page, params, fn) {
		var http = new XMLHttpRequest();
		http.open("POST", page);

		http.setRequestHeader("Content-type",
				"application/x-www-form-urlencoded");
		//          http.setRequestHeader("Content-length", params.length);

		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				fn(http.response);
			}
		}
		http.send(params);
	}
	console.log("here 1");
	return {"ajaxPost":ajaxPost,"ajax":ajax,"tst":"?","getFile":getFile,"getXmlFile":getXmlFile,"getXmlKey":getXmlKey,getCompleteXml:getCompleteXml};
});
