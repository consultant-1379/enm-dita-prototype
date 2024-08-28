define(["DomStuff","ajax","keys","fetchTopics","navTopics","properties"], function (domStuff,ajax,keys,fetch,navT,props) {
	var topics=[],levels=[0,0],level=0;
	function processMap(obj) {
		function excludeFilters(obj) {
			return false;
		}
		function chapterNo(level) {
			var no=[];
			for (var i=0;i<=level;i++) {
				no.push(""+levels[i]);
			}
			var str=no.join(".");
			console.log(str);
			return str;
		}
		var nodeHandler={
			"chapter":function(obj,start){
				var node=obj.node;
				if (start) {
					level=0;
					levels[level+1]=0;					
					levels[level]++;
					obj.number=chapterNo(level);
					var key=node.getAttribute("keyref");
					if (key) {
						var keyNode=keys.getKey(obj.scopeIndex,key);
						obj.file=keyNode.getAttribute("href");
						obj.level=(level+1);
						topics.push(obj);
					}
				} else {
					level=0;
				}
			},
			"mainbooktitle":function(obj,start){
				var node=obj.node;
				if (start) {
				} else {
					props.properties[node.nodeName]=node;
				}
			},
			"booktitle":function(obj,start){
				var node=obj.node;
				if (start) {
				} else {
					props.properties[node.nodeName]=node;
				}
			},
			"booktitlealt":function(obj,start){
				var node=obj.node;
				if (start) {
				} else {
					props.properties[node.nodeName]=node;
				}
			},
			"bibliolist":function(obj,start){
				var node=obj.node;
				if (start) {
					var key=node.getAttribute("keyref");
					if (key) {
						obj.level=(level+1);
						topics.push(obj);
					}
				}
			},
			"topicref":function(obj,start){
				var node=obj.node;
				if (start) {
					level++;
					levels[level+1]=0;					
					levels[level]++;					
					obj.number=chapterNo(level);
					var key=node.getAttribute("keyref");
					if (key) {
//						var keyNode=keys.getKey(obj.scopeIndex,key);
//						obj.file=keyNode.getAttribute("href");
						obj.level=(level+1);
						topics.push(obj);
					}
				} else {
					level--;
				}
			}
		};

		var nodeAttributeHandler={
		}
		function traverse(obj) {
			var node=obj.node,
			    c=obj.children;
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
			if (c) {
				for (var i=0;i<c.length;i++) {
					traverse(c[i]);
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

		traverse(obj);
		fetch.processFiles(topics,(div)=>{
			var d=document.getElementById("docslot");
			d.setAttribute("contenteditable","true");
			for (var i=d.childNodes.length-1;i>=0;i--) {
				d.removeChild(d.childNodes[i]);
			}
			d.appendChild(div);
			onLoaded();
		});
		function onLoaded() {
			navT.generateToc();
			if (location.hash) {
				var h=location.hash.split("#")[1];
				document.getElementById(h).scrollIntoView();
			}
		}
	}
	return {
		processMap:processMap
	}
});

