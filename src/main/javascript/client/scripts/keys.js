define(function(){
	var scopeList=[],keyFromMap={},repos={};
	scopeList.push({parent:null,scope:{}});
	function getScopeList() {
		return scopeList;
	}
	function addScope(name,parent) {
		var scope={name:name,parent:parent,index:scopeList.length,scope:{}};
		scopeList.push(scope);
		return scope.index;
	}
	function getScopeIndex(i) {
		return scopeList[i];
	}
	function getKey(scopeIndex,keyref) {
		lastKeyref=null;
		function innerGetKey(idx,keyref) {
			var p=scopeList[scopeIndex],keyword="";
			while (p) {
				if (p.scope) {
					var k=p.scope[keyref];
					if (k) {
						if (k.hasAttribute("href")) {
							return k;
						} else if (k.hasAttribute("keyref")) {
							return innerGetKey(scopeIndex,k.getAttribute("keyref"));
						} else if (keyword=k.getElementsByTagName("keyword")) {
							return keyword[0];
						}
					}
				}
				p=p.parent;
			}
			console.log("Can not find:"+keyref);
			return null;
		}
		return innerGetKey(scopeIndex,keyref);
	}
	function getVariables() {
		var r={};
		function test(scope) {
			for (var p in scope) {
				var element=scope[p],
					keywords=element.querySelectorAll("keyword");
				for (var i=0;i<keywords.length;i++) {
					r[keywords[i].textContent]=element;
				}
			}
		}
		for (var i=0;i<scopeList.length;i++) {
			test(scopeList[i].scope);
		}
		return r;
	}
	function getRepoMaps() {
		return repos;
	}
	function addKey(scopeIndex,key,node) {
		var scope=scopeList[scopeIndex].scope;
		if (scope[key]) {
			console.log("Key already defined ",key);
			return 
		}
		scope[key]=node;
		var p=node.parentNode;
		if (p&&p.nodeName=="repomap") {
			var id=p.getAttribute("id"),thisRepo=repos[id]?repos[id]:(repos[id]={});
			thisRepo[key]={"href":node.getAttribute("href"),"node":node};
		}
	}
		
	return {
		getScopeList:getScopeList,
		getKey:getKey,
		addScope:addScope,
		addKey:addKey,
		getScopeIndex:getScopeIndex,
		getVariables:getVariables,
		getRepoMaps:getRepoMaps
	}
});