define(["DomStuff","ajax","keys","domStuff","traverser","Xml2Html","properties"],function (domStuff,ajax,keys,domStuff,traverser,x2h,props) {
	var keyList=[],count=0;

	function processFiles(topics,fn) {
		var div=document.createElement("DIV"),idx=0,p;
		if (p=props.properties["mainbooktitle"]) {
			div.appendChild(x2h.xml2html(p,0,{level:1}));
		}
		function get(i) {
			function next(xml) {
				div.appendChild(x2h.xml2html(xml,topics[i].scopeIndex,topics[i]));
				idx++;
				get(idx);
			}
			if (i>=topics.length) {
				x2h.whenFinished();
				return fn(div);
			}
			ajax.getCompleteXml(topics[i].node.getAttribute("keyref"),topics[i].scopeIndex,next);
		}
		get(idx);
	}
	function convert(obj,then) {
		var topic=document.createElement("DIV");
		list.length=0;
		list.push({key:obj.node.getAttribute("keyref"),scopeIndex:obj.scopeIndex,appendTo:topic,obj:obj});
		fetch(count=0,then);
	}

	function xxprocessFiles(topics,fn) {
		var count=0;
		for (var i=0;i<topics.length;i++) {
			keyList[i]={key:topics[i].node.getAttribute("keyref"),scopeIndex:topics[i].scopeIndex};
		}
		for (var i=0;i<keyList.length;i++) {
			get(i,fn);
		}
	}

	function init() {
		keyList=[];
		count=0;
	}

	function traverse(rec,fn) {		
		rec.children=rec.children?rec.children:[];
		var scopeIndex=rec.scopeIndex;
		var startNode={node:rec.xml,scopeIndex:rec.scopeIndex,parent:rec};
		rec.children.push(startNode);
		
		var nodeAttributeHandler={
			"conkeyref":function(obj,start){
				if (start) {
					var node=obj.node;
					var key=node.getAttribute("conkeyref");
					keyList.push({key:key,scopeIndex:obj.scopeIndex});
					get(keyList.length-1,fn);
				}
			}
		}
		var nodeHandler={
			"image":function(obj,start){
				if (start) {
					var node=obj.node,
					    k=keys.getKey(scopeIndex,node.getAttribute("keyref"));
				}
			}
		}
		var excludeFilters=function(){};
		traverser.traverser(startNode,scopeIndex,nodeHandler,nodeAttributeHandler,excludeFilters);
	}		
	return {
		processFiles:processFiles,
		init:init
	}
});