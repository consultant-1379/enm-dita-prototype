define(function () {
		var domStuff=requirejs("./domStuff.js"),
		document = domStuff.document;

	function handleMap(rec,base) {
		var parent=base?base:null,
		p=parent,
		newObj={parent:parent,scope:{}}
		ctx={level:0,levels:[0,0,0,0,0,0,0,0,0,0],currentScope:newObj};
		parent=newObj;

		while (p) {
			scopeStack.unshift(p);
			p=p.parent;
		}

		readBookmap(rec,parent);
		function readBookmap(rec,parent) {
			function fileForHrefKeyref(ctx,node) {				
				if (node.hasAttribute("href")) {				
					return fileOnPath(rec.location,href);
				}
				if (node.hasAttribute("keyref")) {
					var kref=node.getAttribute("keyref"), noderef=getKey([],kref), href=noderef.getAttribute("href");
				} else {
					var href=node.getAttribute("href");
				}
				return fileOnPath(rec.location,href)
			}
			function excludeFilters(ctx,obj) {
			}
			function getKey(ctx,keyref) {
				var p=ctx.currentScope;
				while (p) {
					if (p.scope) {
						var k=p.scope[keyref];
						if (k) {
							if (k.hasAttribute("href")) {
								return k;
							}
							if (k.hasAttribute("keyref")) {
								return getKey(ctx,k.getAttribute("keyref"));
							}
						}
					}
					p=p.parentScope;
				}
				console.log("Can not find:"+keyref);
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
			
			var nodeHandler={
				"chapter":function(ctx,obj,start){
					var node=obj.node;
					if (start) {
						obj.level=ctx.level=1;
						ctx.levels[obj.level]++;
						ctx.levels[ctx.level+1]=0;
						obj.section=""+ctx.levels[1];
						console.log(obj.section);
					} else {
						ctx.level=0;
					}
				},
				"topicref":function(ctx,obj,start){
					var node=obj.node;
					if (start) {
						ctx.level++;
						obj.level=ctx.level;
						ctx.levels[ctx.level+1]=0;
						ctx.levels[obj.level]++;
						var arr=[];
						for (var i=1;i<=ctx.level;i++) {
							arr.push(""+ctx.levels[i]);
						}
						obj.section=""+arr.join(".");
						console.log(obj.section);
					} else {
						ctx.level--;
					}
				},
				"keydef":function(ctx,obj,start){
					var node=obj.node;
					if (start) {
						var key=node.getAttribute("keys"),
						keys=key?key.split(" "):[];
						for (var i=0;i<keys.length;i++) {
							if (ctx.currentScope.scope[keys[i]]) {
								console.log(keys[i]+" Already defined");
							} else {
								ctx.currentScope.scope[keys[i]]=node;
							}
						}
					}
				},
				"mapref":function(ctx,obj,start){
					var node=obj.node;
					if (start) {
						if (node.hasAttribute("keyref")) {
							var kref=node.getAttribute("keyref"),noderef=getKey(ctx,kref),href=noderef?noderef.getAttribute("href"):kref;
						} else {
							var href=node.getAttribute("href");
						}
						console.log(href);
						
						//var newfile=fileOnPath(rec.location,href)
						//checkBookmap(dir[newfile]);
					}
				}
			};

			var nodeAttributeHandler={
				"keyscope":function(ctx,obj,start){
					if (start) {
						var node=obj.node;
						obj.parentScope=ctx.scope;
						obj.scopeName=node.getAttribute("keyscope");
						obj.scope={};
						ctx.currentScope=obj;
					} else {
						ctx.currentScope=obj.parentScope;
					}
				}
			}

			
			function traverse(obj) {
				var node=obj.node,
				    c=node.childNodes;
				if (node.nodeType==1) {
					if (excludeFilters(ctx,obj)) return;
					var atts=node.attributes;
					for (var i=0;i<atts.length;i++) {
						if (nodeAttributeHandler[atts[i].name]) {
							nodeAttributeHandler[atts[i].name](ctx,obj,true);
						}
					}
				}
				if (nodeHandler[node.nodeName]) {
					nodeHandler[node.nodeName](ctx,obj,true);
				}
				if (c&&c.length) {
					obj.children=[];
					for (var i=0;i<c.length;i++) {
						var newObj={node:c[i],parent:obj};
						obj.children.push(newObj);
						traverse(newObj);
					}
				}
				if (nodeHandler[node.nodeName]) {
					nodeHandler[node.nodeName](ctx,obj,false);
				}
				if (node.nodeType==1) {
					var atts=node.attributes;
					for (var i=0;i<atts.length;i++) {
						if (nodeAttributeHandler[atts[i].name]) {
							nodeAttributeHandler[atts[i].name](ctx,obj,false);
						}
					}
				}
			}
			if (!rec.xml) return;
			traverse({node:rec.xml,parent:parent});
		}
		
	}
	function testFunction() {
		console.log("test1");
	}
	return {
		testFunction:testFunction,
		handleMap:handleMap
	}
});

