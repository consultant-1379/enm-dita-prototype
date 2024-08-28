define(["button","parser","rightMenu","crumbs","dtdParts","Xml2Html","keyboard","nav","navTopics"],function(button,parser,rightMenu,crumbs,parts,x2h,keyb,nav,navT){
	var topButtons=[
		["xref","cite","option","codeph","uicontrol","cmdname","varname","parmname","term","filepath","systemoutput","userinput","tm","sub","sup","ph","fn"]
//		["dl","ol","ul","fig","imagemap","image","note","table","hazardstatement","codeblock"],
//		["abbreviated-form","draft-comment"]
	],
	sideButtons=["p","section","title","example","results","steps","step","cmd"],
	isAcodeBlock={"pre":true,"codeblock":true,"msgblock":true},
	dialogShowen=false,
	blocksShowen=false;
	function topNavMouseEnter(event) {
		var sel=button.getSelection(),p,str;
		var cascade=[];
		for (var i in button.buttons) {
			var el=document.getElementById(i);
			if (el) {
				el.style.backgroundColor="";
			}
		}
		
		if (sel && (p=sel.focusNode)) {
			if (sel.anchorNode) {
				parser.htmlSelection(sel,"XYXY");
				var status=parser.getStatus(),
					expected=(status&&status.expected)?status.expected:[];
				for (var i=0;i<expected.length;i++) {
					var el=document.getElementById("button."+status.strings[expected[i]]);
					if (el) {
						el.style.backgroundColor="LightGreen";
					}
				}
			}
			crumbs.setCrumbs(p);
		}
	}
	function addTopButtons() {
		var menu=document.getElementById("topnav");
		
		for (var y=0;y<topButtons.length;y++) {
			var div=document.createElement("DIV"),
				line=topButtons[y];
			menu.appendChild(div);
			for (var x=0;x<line.length;x++) {
				var b=button.createButton(line[x]);
				div.appendChild(b);
			}
		}
		menu.appendChild(div=document.createElement("DIV"));
		div.setAttribute("id","elementpath");
//		menu.addEventListener("mouseenter",topNavMouseEnter,false);
		var div=document.getElementById("docslot");
		div.addEventListener("mousedown",topNavMouseEnter,false);
		div.addEventListener("mouseup",topNavMouseEnter,false);
	}
	function buttonToggleLeave(e) {
		e.target.style.display="none";
	}
	function buttonToggleOver(e) {
		var t=e.target;
		t=(t.nodeName.toLowerCase()=="img")?t.parentNode:t;
		var fordiv=t.getAttribute("fordiv"),div=document.getElementById(fordiv);
		div.style.display="block";
	}
	function addSideButtons() {
		var menu=document.getElementById("sidenav"),list=["TOC","SDI"],obj={};
		for (var i=0;i<list.length;i++) {
			obj.button=document.getElementById("hoverButton"+list[i]);
			obj.button.onclick=buttonToggleOver;
			obj.fordiv=document.getElementById(obj.button.getAttribute("fordiv"));
			obj.fordiv.onmouseleave=buttonToggleLeave;
		}
		
//		menu.innerHTML=nav.leftMenu;
		return;
		for (var y=0;y<sideButtons.length;y++) {
			var div=document.createElement("DIV");
			var b=button.createButton(sideButtons[y])
			div.appendChild(b);
			menu.appendChild(div);
			menu.addEventListener("mouseenter",
				function( event ) {
				},false);
		}
	}
	function addRightButtons() {
		var rightButtons=["New","Save","Open"]
		var menu=document.getElementById("rightnav");
		
		for (var i=0;i<rightButtons.length;i++) {
			var div=document.createElement("DIV");
			var b=document.createElement("BUTTON");
			div.appendChild(b);
			menu.appendChild(div);
			menu.addEventListener("mouseenter",
				function( event ) {
				},false);
		}
	}
	function clearButtons(e){
		var ret;
		while ((ret=document.getElementsByClassName("tempButtons")) && ret.length) {
			for (var i=0;i<ret.length;i++) {
				if (ret[i].nodeName.toUpperCase()=="BUTTON") {
					ret[i].parentNode.removeChild(ret[i]);
				}
			}
			for (var i=0;i<ret.length;i++) {
				if (ret[i].nodeName.toUpperCase()=="DIV") {
					ret[i].parentNode.removeChild(ret[i]);
				}
			}
		}
		dialogShowen=false;
	}
	function buttonAction(e){
		var b=e.target,
			p=b.parentNode,
			top=p.parentNode,
			node=x2h.createStruct(b.textContent,p);
		clearButtons(e);
		blocksShowen=false;
		return;
	}
	function testForCodeblock() {
		var sel=button.getSelection();
		if (sel && sel.focusNode) {
			var p=sel.focusNode,
				pp=p.parentNode,
				x=pp.getAttribute("_ditaname");
			if (isAcodeBlock[x]) {
				var v=p.nodeValue,l=sel.focusOffset;
				if (l<p.nodeValue.length) {
					p.nodeValue=v.substring(0,l)+"\n"+v.substring(l,v.length);
				} else {
					p.nodeValue=v+"\n\n";
				}
				x2h.setCursor(p,sel.focusOffset+1);
			}
		}
	}
	function parseFrom(p,insertPoint) {
		var status=parser.parseFrom(p,insertPoint),
			expected=(status&&status.expected)?status.expected:[],
			result=[];
		for (var i=0;i<expected.length;i++) {
			var s=status.strings[expected[i]];
			result.push(s);
		}
		return result;
	}
	function parseAtCursor(e) {
		if (dialogShowen) return;
		if (blocksShowen) return;
		var sel=button.getSelection(),
		    menuRec={};
		if (!sel) return;
		if (!sel.focusNode) return;
		var p=sel.focusNode,blocks=[];
		while (p) {
			if (p.nodeType==1) {
				var name=p.getAttribute("_ditaname"),
					block=name?parts.blocks[name]:false;
				if (block) {
					blocks.push(p);
				}
			}
			p=p.parentNode;
		}
		blocks.reverse();
		var menu=[];
		for (var i=blocks.length-1;i>0;i--) {
			var rec={};
			menu.push(rec);
			rec.node=p=blocks[i];
			rec.top=p.parentNode;
			var r=parseFrom(p,p.nextSibling),
			result=rec.result=[];
			for (var i2=0;i2<r.length;i2++) {
				if (parts.blocks[r[i2]]) result.push(r[i2]);
			}
		}
		var m=1;
		menu.forEach((button)=>{
			if (button.result && button.result.length) {
				var div=document.createElement("DIV");
				blocksShowen=true;
				div.setAttribute("class","tempButtons");
				for (var i=0;i<button.result.length;i++) {
					var b=document.createElement("BUTTON");
					b.onclick=buttonAction;
					b.setAttribute("class","tempButtons");
					b.textContent=rec.str=button.result[i];
					div.appendChild(b);
				}
				button.top.insertBefore(div,button.node.nextSibling);
			}
		});
	}
	function removeThinSpace(s) {
		var r=[];
		for (var i=0;i<s.length;i++) {
			var ch=s.charAt(i);
			if (ch=="\u2009") continue;
			r.push(ch);
		}
		return r.join("");
	}
	function checkStatus() {
		topNavMouseEnter();
	}
	function keyboardUpEventHandler(e) {
		keyb.up(e);
		checkStatus();
	}
	function keyboardEventHandler(e) {
		keyb.down(e);
		checkStatus();
		if (e.code=="NumpadEnter" || e.code=="Enter" || e.code=="Escape") {
			if (e.code!="Escape" && blocksShowen) testForCodeblock();
			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();
			e.cancelBubble=true;
			e.returnValue=false;
			if (e.code=="Escape") {
				clearButtons();
				dialogShowen=false;
				blocksShowen=false;
				return;
			}
			parseAtCursor(e);
		}
	}
	function keyboard() {
		var mainDiv=document.getElementById("docslot");
		mainDiv.onkeydown = keyboardEventHandler;
		mainDiv.onkeyup = keyboardUpEventHandler;
	}
	function init() {
		addTopButtons();
		addSideButtons();
		rightMenu.init();
		keyboard();
	}
	return {init:init}
});