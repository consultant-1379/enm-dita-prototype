define(["dtdParts","parser"],function(dtdparts,parser){
	var elementDialog=null,savedNode,dialogOpen=false;
	function getDialog() {
		return elementDialog=elementDialog?elementDialog:document.getElementById("elementDialog");
	}
	function closeDialog() {
		elementDialog.style.display="none";
		dialogOpen=false;
	}
	function createOptions(list,ret) {
		for (var i = 0; i < list.length; i++) {
			var option = document.createElement("OPTION");
			option.value = list[i];
			option.textContent = list[i];
			ret.appendChild(option);
		}
	}
	function createSelection(list,sel) {
		var ret=document.createElement("SELECT");
		createOptions(list,ret);
		if (sel) {
			ret.value=sel;
		}
		return ret;
	}
	function toList(s) {
		s=s.substring(1,s.length-1);
		return ("|"+s).split("|");
	}
	function createInput(value,type) {
		var ret=document.createElement("INPUT");
		ret.setAttribute("type","text");
		ret.setAttribute("size","50");
		if (value=="null") return ret;
		ret.value=value;
		return ret;
	}
	function clearChildren(node) {
		while (node && node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}
	function handleOptions(node) {
		var rec=parser.parseFrom(node,node),
		sel=document.getElementById("elementDialogRenameSelection"),
		list=[];
		rec.expected.forEach((a)=>{list.push(rec.strings[a]);});
		clearChildren(sel);
		createOptions(list,sel);				
	}
	function attributeDialog(node) {
		getDialog();
		if (dialogOpen) return;
		var skip={"xmlns:ditaarch":true,"ditaarch:DITAArchVersion":true,"domains":true,"xtrc":true,"xtrf":true,"class":true,"base":true};
		var ret=document.createElement("TABLE"),tbody=document.createElement("TBODY"),dtdAtts=dtdparts.DtdAttributes[node.getAttribute("_ditaname")];
		savedNode=node;
		ret.appendChild(tbody);
		
		for (var i = 0; i < dtdAtts.length; i++) {
			var att=dtdAtts[i];
			if (skip[att.name]) continue; 
			var row = document.createElement("TR"),p=null;
			tbody.appendChild(row);

			var cell=document.createElement("TD");
			cell.textContent = att.name;
			row.appendChild(cell);

			cell=document.createElement("TD");
			if (att.type.startsWith("(")) {
				var actual=node.getAttribute("__"+att.name);
				p=createSelection(toList(att.type),actual);
			} else {
				p=createInput(att.value,att.type);
				var actual=node.getAttribute("__"+att.name);
				if (actual) {
					p.value=actual;
				}
			}
			p.className="sys$dialogAtt";
			p.setAttribute("attname",att.name);
			cell.appendChild(p);
			row.appendChild(cell);
		}
		handleOptions(node);
		dialogOpen=true;
		elementDialog.style.display="block";

		return ret;
	}
	function getDialogValues() {
		var node=savedNode,
			nodes=document.getElementsByClassName("sys$dialogAtt");
		for (var i=0;i<nodes.length;i++) {
			var value=nodes[i].value;
			var name="__"+nodes[i].getAttribute("attname");
			if (value) {
				node.setAttribute(name,value);
			} else {
				if (node.hasAttribute(name)) {
					node.removeAttribute(name);
				}
			}
		}
	}
	return {attributeDialog:attributeDialog,getDialogValues:getDialogValues,closeDialog:closeDialog}
});