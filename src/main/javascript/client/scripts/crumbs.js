define(["dtdParts","dialog","Xml2Html"],function(dtdparts,attDialog,x2h){
	var crumbrecs={},list=[],atts=dtdparts.DtdAttributes,options=[],crumbrecs={},dialog=null,currentRec=null;
	document.getElementById("elementDialog");
	function getOption(i) {
		if (i<options.length) return options[i];
		var id="sys$option_"+i,
			rec=options[i]=optionrecs[id]={myid:i,id:id,
					option:document.createElement("OPTION"),
					node:null};
		rec.option.setAttribute("id",rec.id);
		return rec;
	}
	function setupDialog() {
		dialog=document.getElementById("elementDialog");
		var OK=document.getElementById("elementDialogOK"),
			cancel=document.getElementById("elementDialogCancel"),
			remove=document.getElementById("elementDialogRemove"),
			rename=document.getElementById("elementDialogRename");
		OK.onclick=elementHandlerOK;
		cancel.onclick=elementHandlerCancel;
		remove.onclick=elementHandlerRemove;
		rename.onclick=elementHandlerRename;
	}
	function elementHandlerRemove() {
		var node=currentRec.node;
		while (node.firstChild) {
			node.parentNode.insertBefore(node.removeChild(node.firstChild),node);
		}
		node.parentNode.removeChild(node);
		attDialog.closeDialog();
	}
	function elementHandlerRename(e) {
		var node=currentRec.node,
		select=document.getElementById("elementDialogRenameSelection"),
		val=select.value;
		var newNode=x2h.replaceNode(node,val);
		attDialog.closeDialog();
	}
	function elementHandlerOK() {
		attDialog.getDialogValues();
		attDialog.closeDialog();
	}
	function elementHandlerCancel() {
		attDialog.closeDialog();
	}
	function elementHandler(e){
		var id=e.target.getAttribute("id"),
			rec=crumbrecs[id],
			node=rec.node,
			dita=node.getAttribute("_ditaname"),
			attributes=atts[dita];
		currentRec=rec;
		if (dialog===null) {
			setupDialog();
		}
		var div=document.getElementById("elementDialogDiv");
		while (div.firstChild) {
			div.removeChild(div.firstChild);
		}
		div.appendChild(attDialog.attributeDialog(node));
//		{"name":"id","type":"NMTOKEN","mode":"#IMPLIED","value":"null"}
	}
	function getCrumb(i) {
		if (i<list.length) return list[i];
		var id="sys$crumb_"+i,
			rec=list[i]=crumbrecs[id]={myid:i,id:id,
					button:document.createElement("BUTTON"),
					node:null};
		rec.button.setAttribute("id",rec.id);
		rec.button.style.backgroundColor="dfdfff";
		rec.button.onclick=elementHandler;
		return rec;
	}  
	function setCrumb(i,p) {
		var rec=getCrumb(i);
		rec.button.textContent=p.getAttribute("_ditaname");
		rec.button.setAttribute("name",p.getAttribute("_ditaname"));
		rec.node=p;
		return rec;
	}  
	function setCrumbs(p) {
		var myList=[],elpath=document.getElementById("elementpath");
		while (elpath.childNodes.length>0) {
			elpath.removeChild(elpath.firstChild);
		}
		while (p) {
			if (p.nodeType==1 && (str=p.getAttribute("_ditaname"))) {
				myList.unshift(p);
			}
			p=p.parentNode;
		}
		for (var i=0;i<myList.length;i++) {
			var rec=setCrumb(i,myList[i]);
			elpath.appendChild(rec.button);
		}
	}
	return {setCrumbs:setCrumbs}
});