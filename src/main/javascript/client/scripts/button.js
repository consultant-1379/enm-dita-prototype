define(["traverser","Xml2Html"],function(traverser,x2h){
	var buttons={};
	function buttonClicked(e) {
		var rec=buttons[this.id];
		if (rec&&rec.click) {
			rec.click(rec);
		}
	}
	function parents(node) {
		var list=[],p=node;
		while (p) {
			list.push(p);
			p=p.parentNode;
		}
		return list;
	}
	function findCommonAncestor(p1,p2) {
		var idx=0,a=parents(p1),b=parents(p2);
		for (var i=0;i<a.length;i++) {
			if ((idx=b.indexOf(a[i]))>-1) return {node:a[i],anchorIndex:i,focusIndex:idx};
		}
		return null;
	}
	function getSelection() {
		var sel=window.getSelection();
		if (sel.isCollapsed) return {point:true,focusNode:sel.focusNode,focusOffset:sel.focusOffset};
		if (sel.focusNode===sel.anchorNode) 
			return {sameNode:true,focusNode:sel.focusNode,focusOffset:Math.max(sel.focusOffset,sel.anchorOffset),anchorNode:sel.anchorNode,anchorOffset:Math.min(sel.focusOffset,sel.anchorOffset),rangeCount:sel.rangeCount,ancestor:sel.anchorNode,list:[sel.anchorNode],depth:1,focusIndex:1,anchorIndex:1};
		var depth=findCommonAncestor(sel.anchorNode,sel.focusNode),
			p=depth.node,
			order=[],
			list=[];
		traverser.nodeTraverser(p,function(n,start){
			if (start) {
				if (n===sel.anchorNode||n===sel.focusNode) order.push(n);
				list.push(n);focus
			}
		});
		if (order[0]==sel.anchorNode) {
			return {ancestor:depth.node,anchorIndex:depth.anchorIndex,focusIndex:depth.focusIndex,focusNode:sel.focusNode,focusOffset:sel.focusOffset,anchorNode:sel.anchorNode,anchorOffset:sel.anchorOffset,rangeCount:sel.rangeCount,list:list,depth:Math.max(depth.anchorIndex,depth.focusIndex)};
		}
		return {ancestor:depth.node,
		anchorIndex:depth.focusIndex,focusIndex:depth.anchorIndex,
		focusNode:sel.anchorNode,focusOffset:sel.anchorOffset,anchorNode:sel.focusNode,anchorOffset:sel.focusOffset,rangeCount:sel.rangeCount,list:list,depth:Math.max(depth.anchorIndex,depth.focusIndex)};
	}
	function doAlert(button) {
		var sel=getSelection();
		var depth=sel.depth?sel.depth:null;
		if (depth==1) {
			markup(sel,button);
		}
		if (depth && depth.anchorIndex!=depth.focusIndex) {
		}
	}

	function strParts(s,offset) {
		return {l:s.substring(0,offset),r:s.substring(offset)}
	}
	function remove(node) {
		node.parentNode.removeChild(node);
		return node;
	}

	function markup(sel,button) {
		if (sel.point) return;
		var node=sel.anchorNode,
			endNode=sel.focusNode,
			value=""+node.nodeValue;
		if (node==endNode) {
			var start=value.substring(0,sel.anchorOffset),
				middle=value.substring(sel.anchorOffset,sel.focusOffset),
				right=value.substring(sel.focusOffset),
				element=x2h.createNode(button.id);
			if (start) {
				node.parentNode.insertBefore(document.createTextNode(start),node);
			}
			node.parentNode.insertBefore(element,node);
			element.appendChild(document.createTextNode(middle));
			if (right) {
				node.parentNode.insertBefore(document.createTextNode(right),node);
			}
			node.parentNode.removeChild(node);
		} else if (node.parentNode==endNode.parentNode) {
			element=x2h.createNode(button.id);			
			var p1=strParts(sel.anchorNode.nodeValue,sel.anchorOffset),
				p2=strParts(sel.focusNode.nodeValue,sel.focusOffset),
				parentNode=node.parentNode,
				p=null,
				start=null,
				end=null;
			if (p1.l && p1.r) {
				parentNode.insertBefore(document.createTextNode(p1.l),node);
				parentNode.insertBefore(start=document.createTextNode(p1.r),node);
				parentNode.removeChild(node);
			} else if (p1.l) {
				start=node.nextSibling;
			} else {
				start=node;
			}
			if (p2.l && p2.r) {				
				parentNode.insertBefore(end=document.createTextNode(p2.l),endNode);
				parentNode.insertBefore(document.createTextNode(p2.r),endNode);
				parentNode.removeChild(endNode);
			} else if (p2.l) {
				end=endNode;
			} else {
				end=endNode.previousSibling;
			}
			parentNode.insertBefore(element,start);
			p=start;
			while (p) {
				var next=p.nextSibling;
				element.appendChild(remove(p));
				if (p==end) break;
				p=next;				
			}
		}
	}

	function doAlertOld(button) {
		var pos=sel.anchorNode;
		if (sel.focusNode==sel.anchorNode && sel.focusOffset==sel.anchorOffset) {
			//no selection
			pos=sel.anchorNode;
		} else {
			pos=sel.anchorNode;
			if (sel.focusNode==sel.anchorNode && sel.focusNode.nodeName=="#text") {
				var nodes=[];
				var parent=sel.focusNode.parentNode;
				var text=pos.nodeValue;
				var p1=Math.min(sel.anchorOffset,sel.focusOffset);
				var p2=Math.max(sel.anchorOffset,sel.focusOffset);
				parent.removeChild(pos);
				if (p1>0) {
					nodes.push(document.createTextNode(text.substring(0,p1)));
				}
				var node=document.createElement("SPAN");
				node.className=button.id;
				nodes.push(node);
				node.appendChild(document.createTextNode(text.substring(p1,p2)));
				if (p2<text.length) {
					nodes.push(document.createTextNode(text.substring(p2,text.length)));
				}
				for (var i=0;i<nodes.length;i++) {
					parent.insertBefore(nodes[i],sel.focusNode);
				}
				
			}
			return;
		}
		var types=["","SPAN","DIV","DIV","DIV"];
		while (pos.nodeName!=types[button.type] && pos.parentNode!=null) {
			pos=pos.parentNode;
		}
		pos.className=button.id;
//		alert(pos.className+" "+button.id);
	}
	function createButton(txt,type) {
		var button = document.createElement("BUTTON");
		var t = document.createTextNode(txt);
		var id="button."+txt;
		button.className=(["","inline","block","tree","inlineBlock"])[type];
	    button.setAttribute("id",id);
	    buttons[id]={id:txt,click:doAlert,button:button,type:type};
		button.onclick=buttonClicked;
		button.appendChild(t);
		return button;
	}
	return {
		createButton:createButton,getSelection:getSelection,buttons:buttons
	}
});