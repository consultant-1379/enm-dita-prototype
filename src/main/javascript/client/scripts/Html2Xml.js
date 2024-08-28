define(["keys","ajax","domStuff","dtdParts"],function(keys,ajax,domStuff,dtdParts){
	var xmldom=null;
	function ditaNode(node){
		var name=node.getAttribute("_ditaname");
		if (name=="CDATA") {
			return xmldoc.document.createCDATASection(node.textContent);
		}
		var newNode=xmldom?xmldom.createElement(name):(xmldom=domStuff.domParser.parseFromString("<"+name+"/>","text/xml")).firstChild,
			atts=node.attributes;
		
		for (var i=0;i<atts.length;i++) {
			var a=atts[i],
				n=a.name,
				t=a.value;
			if (n=="__ecount") continue;
			if (n.startsWith("__") && !n.startsWith("___")) {
				newNode.setAttribute(n.substring(2,n.length),t);
			}
		}
		return newNode;
	}
	
	function getTopic(p) {
		while (p) {
			if (p.nodeType==1 && dtdParts.topics[""+p.getAttribute("_ditaname")]) return p;
			p=p.parentNode;
		}
		return p;
	}
	
	function exportTopic(html) {
		var p=getTopic(html);
		var s='<?xml version="1.0" encoding="utf-8"?>\n'+dtdParts.topics[p.getAttribute("_ditaname")]+"\n";
		return {data:s+domStuff.serializer.serializeToString(html2xml(p)),md5:p.getAttribute("__id"),encoding:"utf8"};
	}
	
	function html2xml(node) {
		xmldom=null;
		function traverse(node) {
			var c=node.childNodes,newNode=null,handler;
			switch(node.nodeType) {
				case 1:{
					newNode=ditaNode(node);
				} break;
				case 3:{
					newNode=xmldom.createTextNode(node.nodeValue);
				} break;
				case 7:{
					newNode=xmldom.createProcessingInstruction(node.target,node.data);
				} break;
				case 8:{
					newNode=xmldom.createComment(node.nodeValue);
				} break;
			}
			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					newNode.appendChild(traverse(c[i]));
				}
			}
			return newNode;
		}
		return traverse(node);
	}
	return {html2xml:html2xml,exportTopic:exportTopic};
});