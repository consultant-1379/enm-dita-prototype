define(function () {
    var objList=[];
	function copyArray(p) {
		if (p && (p.length || p.length==0)) {			
			var r=[];
			for (var i=0;i<p.length;i++) {
				r.push(p[i]);
			}
			return r;
		}
		return p;
	}

    function traverser(startNode,scopeIndex,nodeHandler,nodeAttributeHandler,excludeFilters) {
		objList.push(startNode);

		function traverse(obj) {
			var node=obj.node,c=null;
			if (node.childNodes) {
				c=copyArray(node.childNodes);
			} else if (node.firstChild) {
				c=[node.firstChild];
			}
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
					var idx=objList.length;
					var newObj={node:c[i],scopeIndex:scopeIndex,parent:obj,idx:idx};
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
		traverse(startNode);
		return objList;
	}		
    function nodeTraverser(start,test,params) {
		params=params?params:{};
		params.skipTest=params.skipTest?params.skipTest:nullFn;

		function nullFn(){};

		function traverse(node) {
			var c=null;

			if (params.skipTest(node)) {
				return;
			}

			if (node.childNodes) {
				c=copyArray(node.childNodes);
			} else if (node.firstChild) {
				c=[node.firstChild];
			}

			test(node,true);

			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					traverse(c[i]);
				}
			}

			test(node,false);

		}
		traverse(start);		
	}		

	return {
		traverser:traverser,nodeTraverser:nodeTraverser
	}
});