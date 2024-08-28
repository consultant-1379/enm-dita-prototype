define(["DomStuff","ajax","keys"],function (domStuff,ajax,keys) {
	var document = domStuff.document,
		dir={},
		scopeIndex=0,
		mapStack=[],
		currentMap=null,
		currentMapId=null,
		mapTypes={"map":true,"bookmap":true},
		masterMap={};

	function rootNode(node) {
		var p=node;
		while (p) {
			if (p.nodeType==1) return p;
			p=p.firstChild;
		}
		return null;
	}

	function getMapMetadata(fn) {
		return fn();
		var count=0;
		masterMap=keys.getRepoMaps();
		function handleFile(data) {
			var rec=JSON.parse(""+data);
			masterMap[rec.md5].meta=rec;
			count--;
			if (!count) return fn();
		}
		for (var file in masterMap) {
			if (file.length==32) {
				count++;
				ajax.getFile(file,handleFile);
			}
		}
		if (!count) return fn();
	}


	function getMap(id,whenFinished) {
		var getCount=0;

		ajax.getXmlFile(id,(xml)=>{
			readBookmap(xml,null);
		});



		function getHref(scopeIndex,node) {
			if (node.hasAttribute("href")) return node.getAttribute("href");
			if (node.hasAttribute("keyref")) return keys.getKey(scopeIndex,node.getAttribute("keyref")).getAttribute("href");
			return null;
		}

		function findParentType(obj,types) {
			while (p) {
				if (types[p.node.nodeName]) {
					return p;
				}
				p=p.parent;
			}
			return null;
		}

		function readBookmap(xml,parent) {
			var startNode={node:xml,scopeIndex:scopeIndex,parent:parent};

			function getInnerXml(obj) {
				function inner(obj) {
					function handleFile(xml) {
						obj.children=obj.children?obj.children:[];
						var newObj={node:xml,scopeIndex:obj.scopeIndex,parent:obj};
						obj.children.push(newObj);
						getCount--;
						doTraverse(newObj);
					}
					var node=obj.node;
					getCount++;
					var href=getHref(obj.scopeIndex,node);
					ajax.getXmlFile(href,handleFile);
				}
				inner(obj);
			}
			
			var nodeHandler={
				"keydef":function(obj,start){
					var node=obj.node;
					if (start) {						
						var key=node.getAttribute("keys"),
						nkeys=key?key.split(" "):[];
						for (var i=0;i<nkeys.length;i++) {
							keys.addKey(obj.scopeIndex,nkeys[i],node,currentMapId);
						}
					}
				},
				"mapref":function(obj,start){
					var node=obj.node;
					if (start) {
						getInnerXml(obj);
					}
				}
			};

			var nodeAttributeHandler={
				"keyscope":function(obj,start){
					if (start) {
						var node=obj.node;
						scopeIndex=keys.addScope(node.getAttribute("keyscope"),keys.getScopeIndex(scopeIndex));
					}
				}
			}

			function excludeFilters(obj) {
			}

			function doTraverse(obj) {
				function then() {
					whenFinished(startNode);
				}
				currentMap=rootNode(obj.node);
				mapStack.push(currentMap);
				currentMapId=currentMap.getAttribute("id");
				traverse(obj);
				currentMap=mapStack.pop();
				currentMapId=currentMap.getAttribute("id");
				if (!getCount) {
					getMapMetadata(then);
				}
			}

			function traverse(obj) {
				var node=obj.node,
				    c=node.childNodes;
				if (node.nodeType==1) {
					if (excludeFilters(obj)) return;
					var atts=node.attributes;
					for (var i=0;i<atts.length;i++) {
						if (nodeAttributeHandler[atts[i].name]) {
							nodeAttributeHandler[atts[i].name](obj,true);
						}
					}
				}
				if (nodeHandler[node.nodeName]) {
					nodeHandler[node.nodeName](obj,true);
				}
				if (c&&c.length) {
					obj.children=[];
					for (var i=0;i<c.length;i++) {
						var newObj={node:c[i],scopeIndex:scopeIndex,parent:obj};
						obj.children.push(newObj);
						traverse(newObj);
					}
				}
				if (nodeHandler[node.nodeName]) {
					nodeHandler[node.nodeName](obj,false);
				}
				if (node.nodeType==1) {
					var atts=node.attributes;
					for (var i=0;i<atts.length;i++) {
						if (nodeAttributeHandler[atts[i].name]) {
							nodeAttributeHandler[atts[i].name](obj,false);
						}
					}
				}
			}
			if (!xml) return;
			doTraverse(startNode);
		}		
	}
	
	function testFunction() {
		console.log("test1");
	}
	return {
		testFunction:testFunction,
		getMap:getMap
	}
});