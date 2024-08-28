define(["keys","ajax","parser","dtdParts","directory","traverser"],function(keys,ajax,parser,parts,dir,trav){
	var counters={table:0,fig:0,example:0},
		db={},
	    list=[],
		postProcess=[],
		books={"1_15372-cna.403.3313":"d320a04bea425ce858277811b4ce5e5b","1_1551-cnh.160.9180":"d2405d9774c1a7def3a58d4c720c5556","9_1531-cnh.160.9180":"390c4dc81d13a248aad14e073004d620","7_1543-cnh.160.9180":"367db860d81cc4c6ab505de7cdf9940f","5_1551-cnh.160.9180":"692bb7ff1bad34ae30e7e279bb216096","3_15372-cnh.160.9180":"d721eb75889b7e6102b54213bd3f6e18","3_1551-cnh.160.9180":"b099325dd2097f8de6702093bf302eb5","2_1543-cnh.160.9180":"c431dc2cae7bc39c5d31f48145c9ee57","1_1543-cnh.160.9180":"014b5cc1244ac3c6a4fbcbbe05e96322","1553-cnh.160.9180":"703916b47204cc8907606b753cae2b71","4_1551-cnh.160.9180":"540cb0c4ccef4f04f46bea9de650523f","1_1550-cnh.160.9180":"5754e3a065415b6426debd731d581fd0","2_1551-cnh.160.9180":"5de8c8467875eb63ac0ba356eff708d9","9_1551-cnh.160.9180":"258002f75f0f9e81cadba639d07d68ea","8_1531-cnh.160.9180":"83db6c402cd6b5438ebf748bb95cae9f","9_1553-cnh.160.9180":"1e63bf2eea1723458a603361491806f7","1_00651-cnh.160.9180":"87e6531d09ce7821feeca554bbb77997","1_1531-cna.403.3313":"4722785aaa0139aa7fc88eedeebc35f1","7_1531-cnh.160.9180":"8909cddedb983b04468e25fd5196ae08","15372-cnh.160.9180":"3e0c336109405c7ea62d34b9a9b4f625","10_1553-cnh.160.9180":"1d9e28ea44c427740221b25d0e7eccac","12701-cnh.160.9180":"a07002626327118d0a9b39e4672903f7","5_1543-cnh.160.9180":"35ef5a63c18499e93aa6409c20f5e40b","1543-cnh.160.9180":"c903909a97f4cc8a94dee104aa86902c","4_1553-cnh.160.9180":"eb5f0af1927fe299a7e1c191afa4833d","1531-cnh.160.9180":"81f19b279c79e288c6bd3c3fbf16a81e","19818-cnh.160.9180":"35cb30ba5d1145df35c570e9305fb17c","15432-cnh.160.9180":"0c5c2880e24f7a3ab2fc6dd51c759e7f","10_1551-cnh.160.9180":"6079401d60b409429f6b85dadced275e","22102-cnh.160.9180":"85b4c510dbb89a62ff08189c1efee1bd"},
	    nodeHandler={
		"abbreviated-form":"DIV","alt":"DIV","apiname":"DIV","area":"DIV",
		"category":"DIV","cause":"DIV","change-completed":"DIV","change-historylist":"DIV","change-item":"DIV","change-person":"DIV","change-request-id":"DIV","change-request-reference":"DIV",
		"change-request-system":"DIV","change-summary":"DIV","chdesc":"DIV","chdeschd":"DIV","chhead":"DIV","choice":"DIV","choices":"DIV","choicetable":"DIV","choption":"DIV","choptionhd":"DIV",
		"chrow":"DIV","cite":"SPAN","cmd":"DIV","cmdname":"SPAN","codeblock":"PRE","codeph":"CODE","colspec":"SPAN","conbody":"DIV","concept":"DIV","condition":"DIV",
		"consequence":"DIV","context":"DIV","coords":"DIV","data":"DIV","dd":"DD","desc":"DIV","div":"DIV","dl":"DL","dlentry":"DIV","draft-comment":"DIV","dt":"DT","entry":"TD","equation-block":"DIV",
		"equation-figure":"DIV","equaton-inline":"SPAN","example":"DIV","fig":"FIGURE","filepath":"SPAN","fn":"DIV","glossAcronym":"DIV","glossAlt":"DIV","glossBody":"DIV","glossdef":"DIV","glossentry":"DIV",
		"glossSurfaceForm":"SPAN","glossterm":"SPAN","hazardstatement":"DIV","hazardsymbol":"DIV","howtoavoid":"DIV","image":"IMG","imagemap":"MAP","indexterm":"DIV","info":"DIV","keyword":"DIV","keywords":"DIV",
		"li":"LI","link":"SPAN","linktext":"DIV","menucascade":"SPAN","messagepanel":"DIV","metadata":"SPAN","msgblock":"PRE","msgph":"SPAN","note":"DIV","ol":"OL","option":"SPAN","othermeta":"SPAN","p":"P",
		"parmname":"SPAN","permissions":"SPAN","ph":"SPAN","postreq":"DIV","pre":"PRE","prereq":"DIV","prolog":"DIV","refbody":"DIV","reference":"DIV","related-links":"DIV","remedy":"DIV","resourceid":"DIV",
		"responsibleParty":"DIV","result":"DIV","row":"TR","section":"DIV","shape":"DIV","shortdesc":"DIV","sl":"DIV","sli":"DIV","source":"DIV","step":"DIV","stepresult":"DIV","steps":"DIV","steps-informal":"DIV",
		"steps-unordered":"DIV","stepsection":"DIV","steptroubleshooting":"DIV","stepxmp":"DIV","sub":"SUB","substep":"DIV","substeps":"DIV","sup":"SUP","systemoutput":"SAMP","table":"TABLE",
		"task":"DIV","taskbody":"DIV","tasktroubleshooting":"DIV","tbody":"TBODY","term":"DFN","text":"SPAN","tgroup":"TBODY","thead":"THEAD","title":"DIV","mainbooktitle":"DIV","booktitlealt":"DIV","tm":"SPAN","troublebody":"DIV","troubleshooting":"DIV",
		"troubleSolution":"DIV","typeofhazard":"DIV","uicontrol":"SPAN","ul":"UL","userinput":"KBD","varname":"VAR","xref":"A"},
		structs={
			"ul":["ul","li","p"],
			"ol":["ol","li","p"],
			"li":["li","p"],
			"note":["note","p"],
			"section":["section","title"],
			"example":["example","title"],
			"result":["result","p"],
			"dlentry":["dlentry","dt"],
			"step":["step","cmd"],
			"steps":["steps","step","cmd"],
			"substeps":["substeps","substep","cmd"],
			"substep":["substep","cmd"],
			"stepxmp":["stepxmp","p"],
			"stepresult":["stepresult","p"],
			"info":["info","p"]
		},
		structFn={
//			<img _ditaname="image" class="image" __id="image_mh1_jhk_d3b" __keyref="5db6d19b75b5ad5cb36b4785ac813548" __scalefit="yes" __ecount="14954" src="/repo/0a9/e4e17a1b4b0802440a633d3ac2efe3d5854b0.svg" onerror="this.onerror=null; this.src='/repo/0a9/e4e17a1b4b0802440a633d3ac2efe3d5854b0.svg'" id="e03bb1a67b2b6153595d639855c3ce88_image_mh1_jhk_d3b">
			"fig":(name,p)=>{
				var fig=createNode("fig"),
					title=prompt("Figure Title:"),
					titleNode=title?createNode("title","FIGCAPTION"):null;
				
				var image=createStruct("image",p);
				image.parentNode.removeChild(image);
				if (titleNode) {
					titleNode.textContent=title;
					fig.appendChild(titleNode);
				}
				fig.appendChild(image);
				p.parentNode.insertBefore(fig,p);
				return fig;
			},
			"image":(name,p)=>{
				var keyref=prompt("Image:"),
					image=createNode(name),
					scopeIndex=firstParentAttribute("___scopeIndex",p);
				scopeIndex=scopeIndex?scopeIndex:0;
				image.setAttribute("__keyref",keyref);
				var r=keys.getKey(scopeIndex,keyref);
				r=r?r.getAttribute("href"):"00000000000000000000000000000";
				var src=["","repo",r.substring(0,3),r.substring(3)].join("/");
				image.setAttribute("onerror","this.onerror=null; this.src='"+src+".svg'");
				image.setAttribute("src",src);
				p.parentNode.insertBefore(image,p);
				return image;
			},
			"table":(name,p)=>{
				var columns=prompt("Number of columns:"),
					rows=prompt("Number of rows:"),
					title=prompt("Title:"),
					table=createNode("table"),
					list=[],node,tbody,tgroup,row,entry;
				if (title) {
					node=createNode("title","CAPTION");
					node.textContent=title;
					table.appendChild(node);
				}
				table.appendChild(tgroup=createNode("tgroup"));
				tgroup.setAttribute("__cols",columns);
				for (var i=0;i<columns;i++) {
					var id=i+1;
					tgroup.appendChild(node=createNode("colspec"));
					node.setAttribute("__colname","col"+id);
				}
				tgroup.appendChild(tbody=createNode("tbody"));
				for (var r=0;r<rows;r++) {
					tbody.appendChild(row=createNode("row"));
					for (var c=0;c<columns;c++) {
						row.appendChild(entry=createNode("entry"));
						entry.appendChild(node=makeInput("p"));
					}
				}
				p.parentNode.insertBefore(table,p);
				return table;
			}
		},
		inputNodes=[];

	function setCursor(node,pos) {
		var range = document.createRange();
		var sel = window.getSelection();
		range.setStart(node, pos);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	}

	function createCDATA(node){
		var value=document.createTextNode(node.nodeValue);
		var newNode=document.createElement("DIV");
		newNode.setAttribute("_ditaname","CDATA");
		newNode.setAttribute("class","CDATA");
		newNode.appendChild(value);
		return newNode;
	}
	
	function updateValue(e){
		var t=e.target,
		p=t.parentNode,
		pp=p.parentNode,
		node=document.createTextNode(t.value);
		pp.insertBefore(node,p);
		pp.removeChild(p);
		setCursor(node,node.nodeValue.length);
	}
	function callParser(top,p) {
		var results=[];
		top.insertBefore(parser.failNode,p.nextSibling);
		var list=parser.htmlNodeList(top);
		parser.failNode.parentNode.removeChild(parser.failNode);
		parser.parseContentList(list);
		var status=parser.getStatus(),
			expected=(status&&status.expected)?status.expected:[],
			result=(rec.result=[]);
		for (var i2=0;i2<expected.length;i2++) {
			var s=status.strings[expected[i2]];
			if (parts.blocks[s]) result.push(s);
		}
	}

	function makeInput(label){
		var div=document.createElement("DIV");
		node=document.createElement("LABEL");
		node.textContent=label+": ";
		node.className="sys$label";
		div.appendChild(node);
		node=document.createElement("INPUT");
		node.addEventListener('input', updateValue);
		div.appendChild(node);
//				inputNodes.push(node);
		return div;
	}
	
	function replaceNode(node,name){
		var newNode=createNode(name);
		while (node && node.firstChild) {
			newNode.appendChild(node.removeChild(node.firstChild));			
		}
		var atts=node.attributes;
		for (var i=0;i<atts.length;i++) {
			if (newNode.hasAttribute(atts[i].name)) continue;
			newNode.setAttribute(atts[i].name,atts[i].value);
		}
		node.parentNode.insertBefore(newNode,node);
		node.parentNode.removeChild(node);
	}
	
	function createStruct(name,p){
		if (structFn[name]) return structFn[name](name,p);
		var outList=[];
		var list=structs[name]?structs[name]:[name],node,last;
		for (var i=0;i<list.length;i++) {
			node=createNode(list[i]);
			if (i) {
				outList[i-1].appendChild(node);
			}
			outList.push(node);
		}
		node=makeInput(list[list.length-1]);
		outList[outList.length-1].appendChild(node);
		p.parentNode.insertBefore(outList[0],p);
		node.childNodes[1].focus();
		return outList[0];
	}
	
	function init(){
		counters={table:0,fig:0,example:0};
		db={};
	    list=[];
	}
	
	function createNode(name,otherName){
		var nodeName=otherName?otherName:nodeHandler[name],
			newClass=name,
			newNode=document.createElement(nodeName);
		newNode.setAttribute("_ditaname",name);
		newNode.setAttribute("class",name);
		return newNode;
	}
	
	
	function ditaNode(node){
		var parts={
			"title":function(){
				return (node.parentNode.nodeName=="table")?"CAPTION":((node.parentNode.nodeName=="fig")?"FIGCAPTION":nodeHandler[node.nodeName]);
			},
			"entry":function(){
				return (node.parentNode.nodeName=="row" && node.parentNode.parentNode.nodeName=="thead")?"TH":"TD";
			}
		}
		var nodeName=parts[node.nodeName]?parts[node.nodeName]():nodeHandler[node.nodeName],
			newNode=createNode(node.nodeName,nodeName);
		var attributes=node.attributes;
		for (var i=0;i<attributes.length;i++) {
			newNode.setAttribute("__"+attributes[i].name,attributes[i].value);
		}
		return newNode;
	}

	function getKeyrefNode(scopeIndex,n) {
		var k,val;
		if (!n) return null;
		var ks=n.split("/");
		k=keys.getKey(scopeIndex,ks[0]);
		var tmp=dir.getTarget(k+"/"+n);
		if (!k) return null;
		val=k.getAttribute("href");
		if (!val) return null;
		ks[0]=val;
		val=dir.getTarget(ks.join("/"));
		if (!val) return null;
		return val;
	}

	function getTextKeyref(scopeIndex,node) {
		var k=node.getAttribute("keyref"),val;
		if (!k) return null;
		var key=keys.getKey(scopeIndex,k);
		var keyText=(key && key.nodeName=="keyword")?key.textContent:null;
		return keyText;
	}

	function getAllChildNamed(node,name) {
		var r=[];
		if (node && node.childNodes) {
			for (var p=node.firstChild;p;p=p.nextSibling) {
				if (p.nodeName==name) {
					r.push(p);
				}
			}
		}
		return r;
	}

	function innerText(node,scopeIndex) {
		var r=[], target=getKeyrefNode(scopeIndex,node), titles=getAllChildNamed(target,"title");
		if (!titles.length) return "";
		var p=titles[0];
		function traverse(p) {
			function test(n) {
				if (key=n.getAttribute("conkeyref")) {
					var k=keys.getKey(scopeIndex,key);
				}
			}
			trav.nodeTraverser(p,test,params)
		}
		traverse(p);
	}

	function getTitle(scopeIndex,node) {
		var r=[],
			target=getKeyrefNode(scopeIndex,node.getAttribute("keyref")),
			titles=getAllChildNamed(target,"title");

		if (!titles.length) return "";
		return "";

	}
	
	function xml2html(node,scopeIndex,obj) {
		var ctx={"steps":0,"substeps":0,firstId:null,conkeyrefs:[]};
		ctx.attHandlers={
			"id":function(ctx,node,newNode) {
				if (ctx.conkeyrefs.length>1) return;
				if (ctx.conkeyrefs.length==1 && ctx.conkeyrefs[0]!=node) return;
				if (ctx.start) {
					var id=node.getAttribute("id");
					if (!ctx.firstId) {
						ctx.firstId=id;
						newNode.setAttribute("id",id);
						db[id]=db[id]?db[id]:{};
						db[id].target=newNode;
					} else {
						var newId=ctx.firstId+"_"+id;
						newNode.setAttribute("id",newId);
						db[newId]=db[newId]?db[newId]:{};
						db[newId].target=newNode;
					}
				}
			},
			"keyref":function(ctx,node,newNode) {
				if (ctx.start) {
					var keyref=node.getAttribute("keyref"),
					innerText=node.textContent,
					parts=keyref.split("/");
					if (node.nodeName=="xref") {
						newNode.setAttribute("contentEditable","false");
						postProcess.push({fn:postHandleXref,newNode:newNode,scopeIndex:scopeIndex,"node":node});
						return;
					}
					if (parts.length>1) return;
					var key=keys.getKey(scopeIndex,keyref),
					keyText=(key && key.nodeName=="keyword")?key.textContent:null;
					if (keyText && innerText.length==0) {
						newNode.setAttribute("_keytext",keyText);
					}
				}
			},
			"frame":function(ctx,node,newNode) {
				if (ctx.start) {
					if (ctx.tables) {
						var table=ctx.tables[0];
						if (node.hasAttribute("frame")) {
							table.frame=node.getAttribute("frame");
							if (table.frame!="all") {
								newNode.setAttribute("frame","void");
							}
						}
					} else {
						console.log("?frame in non-table");
					}
				}
			},
			"nameend":function(ctx,node,newNode) {
				if (ctx.start) {
					var table=ctx.tables[0],
						tgroup=table.tgroup,
						names=tgroup?tgroup.names:{};
			        var namest = node.getAttribute('namest'),
					nameend = node.getAttribute('nameend'),
					cspan=0;
					if (namest && nameend) {
						var start = names[namest].index,
							end = names[nameend].index,
							cspan = end - start + 1;
						newNode.setAttribute('colspan', cspan);
					}
				}
			},
			"morerows":function(ctx,node,newNode) {
				if (ctx.start) {
					var moreRowsAttribute = node.getAttribute('morerows');
					newNode.setAttribute('rowspan', parseInt(moreRowsAttribute) + 1);
				}
			},
			"conkeyref":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.conkeyref=list.length;
					newNode.setAttribute("contenteditable","false");
				}
			},
			"_rcref":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.conkeyrefs.unshift(node);
					newNode.setAttribute("contenteditable","false");
				} else {
					ctx.conkeyrefs.shift();
				}
			}
		}
		ctx.handlers={
			"tgroup":function(ctx,node,newNode) {
				if (ctx.start) {
					var table=ctx.tables[0];
					table.tgroup={colspecIndex:0,names:{}};
				} else {
					var table=ctx.tables[0];
					table.tgroup=null;
				}
			},
			"colspec":function(ctx,node,newNode) {
				// <span _ditaname="colspec" class="colspec" colname="col1" colwidth="1.03*" ecount="13613"></span>
				if (ctx.start) {
					var table=ctx.tables[0],
					tgroup=table.tgroup,
					names=tgroup.names;
					names[node.getAttribute("colname")]={index:(tgroup.colspecIndex++),node:node};
					var attributes=node.attributes;
					for (var i=0;i<attributes.length;i++) {
						names[attributes[i].name]=attributes[i].value;
					}
				}
			},
			"table":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.tables=ctx.tables?ctx.tables:[];
					var table={node:node};
					ctx.tables.unshift(table);
				} else {
					ctx.tables.shift();
				}
			},
			"entry":function(ctx,node,newNode) {
				var table=ctx.tables && ctx.tables.length?ctx.tables[0]:null;
				if (!table) {
					return;
				}
				if (ctx.start) {
					if (table.frame && table.frame!="all") {
						newNode.style.borderStyle="none";
					}
				}
			},
			"title":function(ctx,node,newNode) {
				if (ctx.start) {
					var p=node.parentNode;
					if (obj && obj.number && ("|reference|concept|task|troubleshooting|".indexOf('|'+p.nodeName+'|')>-1)) {
						newNode.setAttribute("_keytext",obj.number);
					}
				}
			},
			"image":function(ctx,node,newNode) {
				if (ctx.start) {
					var key=keys.getKey(scopeIndex,node.getAttribute("keyref"));
					key=key?key.getAttribute("href"):"000000000000000000000000000000";
					var str="/repo/"+key.substring(0,3)+"/"+key.substring(3);
					newNode.setAttribute("src",str);
					newNode.setAttribute("onerror","this.onerror=null; this.src='"+str+".svg'");
				}
			},
			'tm': function (ctx,node,newNode) {
				if (ctx.start) {
					var tmType = node.getAttribute("tmtype") === "reg" ? "reg" : "trade";
					newNode.setAttribute("tmtype", tmType);
				}
			},
			"step":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.steps++;
					newNode.setAttribute("_stepNo",""+ctx.steps+".");
				}
			},
			"steps":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.steps=0;
				}
			},
			"substeps":	function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.substeps=0;
				}
			},
			"substep":function(ctx,node,newNode) {
				if (ctx.start) {
					ctx.substeps++;
					newNode.setAttribute("_substepNo",""+ctx.substeps+".");
				}
			},
			"xref":function(ctx,node,newNode) {
				if (ctx.start) {
				} else {
					var href=newNode.getAttribute("__href"),
					scope=newNode.getAttribute("__scope");
					if (href&& href.indexOf("urn:x-ericsson:")>-1) {
						newNode.onclick=handleDocClick;
					} else if (href) {
						newNode.setAttribute("contentEditable","false");
						newNode.setAttribute("target","_blank");
						newNode.setAttribute("href",href);
					}
				}
			}
		}
		function traverse(node) {
			var c=node.childNodes,newNode=null,handler;
			switch(node.nodeType) {
				case 1:{
					newNode=ditaNode(node);
					ctx.start=true;
					if (obj.level&&!ctx.firstNode) {
						ctx.firstNode=node;
						newNode.setAttribute("_level",obj.level);
					}
					
					if (handler=ctx.handlers[node.nodeName]) {
						handler(ctx,node,newNode);
					}
					var atts=node.attributes;
					for (var i=0;i<atts.length;i++) {
						if (ctx.attHandlers[atts[i].name]) {
							ctx.attHandlers[atts[i].name](ctx,node,newNode);
						}
					}					
				} break;
				case 3:{
					newNode=document.createTextNode(node.nodeValue);
				} break;
				case 4:{
					newNode=createCDATA(node);
				} break;
				case 7:{
					newNode=document.createProcessingInstruction(node.target,node.data);
				} break;
				case 8:{
					newNode=document.createComment(node.nodeValue);
				} break;
			}
			if (!newNode) {
				newNode=document.createElement("DIV");
			}
			if (c&&c.length) {
				for (var i=0;i<c.length;i++) {
					newNode.appendChild(traverse(c[i]));
				}
			}
			if (node.nodeType==1) {
				ctx.start=false;
				var atts=node.attributes;
				for (var i=0;i<atts.length;i++) {
					if (ctx.attHandlers[atts[i].name]) {
						ctx.attHandlers[atts[i].name](ctx,node,newNode);
					}
				}
				if (handler=ctx.handlers[node.nodeName]) {
					handler(ctx,node,newNode);
				}
			}

			return newNode;
		}
		return traverse(node);
	}
	function nodeSetScopeIndex(node,scopeIndex) {
		var p=node;
		if (p && p.nodeType!=1 && p.childNodes) {
			p=p.firstChild;
		}
		p.setAttribute("_scopeIndex",scopeIndex);
	}
	function firstParentAttribute(att,p) {
		var r=null;
		while (p) {
			if (p && p.nodeType==1 && (r=p.getAttribute(att))) {
				return r;
			}
			p=p.parentNode;
		}
		return null;
	}
	function whenFinished() {
		for (var i=0;i<postProcess.length;i++) {
			postProcess[i].fn(postProcess[i]);
		}
		
	}
	function getHtmlTextContent(p) {
		var r=[];
		function test(node,start) {
			if (start) {
				if (node.nodeType==3) {
					r.push(node.nodeValue);
				} else if (node.nodeType==1) {
					if (!node.firstChild) {
						var val=node.getAttribute("_keytext");
						if (val) r.push(val);
					}					
				}
			}
		}
		trav.nodeTraverser(p,test,null);
		return r.join("");
	}
	function postHandleXref(rec) {
		var newNode=rec.newNode,
			scope=rec.scopeIndex,
			node=rec.node,
			keyref=newNode.getAttribute("__keyref");
		if (keyref) {
			var parts=keyref.split("/");
			var k=keys.getKey(scope,parts[0]);
			if (k.hasAttribute("href")) {
				parts[0]=k.getAttribute("keys");
				var newKey=parts.join("_");
				if (db[newKey]) {
					newNode.setAttribute("href","#"+newKey);
					var target=db[newKey].target,value;
					if (newNode.textContent.length==0&&target) {
						for (var p=target.firstChild;p;p=p.nextSibling) {
							if (p.nodeType==1 && (value=p.getAttribute("_ditaname")) && value=="title") {
								newNode.textContent=getHtmlTextContent(p);
								newNode.setAttribute("contentEditable","false");
								break;
							}
						}
					}
				}
				
			}
		}		
	}
	function handleDocClick(e) {
		var b=e.target.getAttribute("__href");
		b=b.split(":");
		var i=b.indexOf("reg-doc"),
		bookId=keys.getKey(0,books[b[i+1]]);
		bookId=bookId?bookId.getAttribute("href"):"00000000000000000000000000000";		
		var win = window.open("XmlEditor.html?map="+bookId, '_blank');
		win.focus();
		e.returnValue=false;
		return false;
	}
	
	
	
	return {xml2html:xml2html,init:init,whenFinished:whenFinished,createNode:createNode,createStruct:createStruct,inputNodes:inputNodes,setCursor:setCursor,replaceNode:replaceNode};
})