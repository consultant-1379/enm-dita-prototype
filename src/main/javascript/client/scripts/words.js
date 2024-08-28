define(["keys","ajax","traverser","dtdParts"],function(keys,ajax,traverse,dtd){
	var words={},a="a".charCodeAt(0),z="z".charCodeAt(0),A="A".charCodeAt(0),Z="Z".charCodeAt(0),zero="0".charCodeAt(0),nine="9".charCodeAt(0),
		para=[],paras=[],variables,varStarters={},varCharSet={},varMaxLength=0,keyNode=document.createTextNode("\u0000");

	function isChar(ch) {
		var c=ch.charCodeAt(0);
		if (c>=a && c<=z) return true;
		if (c>=A && c<=Z) return true;
		return false;
	}

	function isDigit(ch) {
		var c=ch.charCodeAt(0);
		if (c>=zero && c<=nine) return true;
		return false;
	}

	function extractText(startNode) {
		var str=[];
		paras=[];
		para=[];

		function testWord(s) {
			for (var i=0;i<s.length;i++) {
				var ch=s.charAt(i);				
			}
		}
		
		function test(node,start) {
			if (start) {
				if (node.nodeType==3) {
					para.push(node);
				}
				if (node.nodeType==1  && !node.hasChildNodes() && node.getAttribute("__keyref") && node.getAttribute("_keytext")) {
					para.push(keyNode);
				}
			} else {
				var dita=(node.nodeType==1)?node.getAttribute("_ditaname"):null;
				if (dita && dtd.blocks[dita]) {
					if (para.length) {
						paras.push(para);
						para=[];
					}
				}
			}
		}

		var params={
			skipTest:(node)=>{
				var skip={"codeblock":true,"prolog":true};
				var dita=(node.nodeType==1)?node.getAttribute("_ditaname"):null;
				if (dita && skip[dita]) {
					return true;
				}
				return false;
			}
		}

		traverse.nodeTraverser(startNode,test,params)

	}
	
	function charSet(str,set) {
		for (var i=0;i<str.length;i++) {
			set[str.charAt(i)]=true;
		}
	}
	
	function searchvariables() {
		var str=[],lastCh=" ";
		function convertStr(s) {			
			for (var i=0;i<s.length;i++) {
				var ch=s.charAt(i);
				if ("\r\n\t".indexOf(ch)>-1) ch=" ";
				if (ch==" " && lastCh==" ") {
					continue;
				}
				str.push(lastCh=ch);
			}
		}
		function convertPara(p) {
			str.length=0;
			lastCh=" ";
			for (var i=0;i<p.length;i++) {
				convertStr(p[i].nodeValue);
			}
			var s=str.join("").trim();
			checkVariables(s);
		}
		function checkVariables(p) {
			for (var i in variables) {
				if (i.trim()) {
					if (p.indexOf(i)>-1) {
						console.log("v:"+i);
						console.log("in:"+p);
					}
				}
			}
		}
		for (var i=0;i<paras.length;i++) {
			convertPara(paras[i]);
		}
	}
	
	function testInlineMarkup() {
		variables=variables?variables:keys.getVariables();
		if (!variables) return;
		for (var i in variables) {
			var s=i.trim();
			if (!s) continue;
			var ch=s.charAt(0);
			varStarters[ch]=varStarters[ch]?varStarters[ch]:[];
			varStarters[ch].push(s);
			charSet(s,varCharSet);
			varMaxLength=Math.max(varMaxLength,s.length);
		}
		extractText(document.getElementById("docslot"));
		searchvariables();
	}

	return {testInlineMarkup:testInlineMarkup};
});