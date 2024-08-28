define(function(){
	function getText(p) {
		var r=[];
		function traverse(node) {
			var c=node.childNodes;
			if (node.nodeType==1 && node.hasAttribute("_keytext")&&(!node.textContent)) {
				r.push(node.getAttribute("_keytext"));
			}
			if (node.nodeType==3) {
				r.push(node.nodeValue);
			}
			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					traverse(c[i]);
				}
			}
		}
		traverse(p);
		return r.join("");
	}
	
	function generateToc() {
		var top=document.createElement("DIV"),
		a,
		levels=[],
		root=document.getElementById("docslot"),
		nodes=root.querySelectorAll('div[_level]>.title');
		levels[0]=top;
		
		for (var i=0;nodes && i<nodes.length;i++) {
			var div=document.createElement("DIV"),
			a=document.createElement("A"),
			level=nodes[i].parentNode.getAttribute("_level");
			a.textContent=getText(nodes[i]);
			a.setAttribute("href","#"+nodes[i].parentNode.getAttribute("id"));
			div.appendChild(a);
			div.className="topicTree";
			levels[level]=div;
			levels[level-1].appendChild(div);
		}
		var p=document.getElementById("sidenavTOC");
		while (p&&p.firstChild) {
			p.removeChild(p.firstChild);
		}
		p.appendChild(top);
		return top;
	}
	return {generateToc:generateToc};
});