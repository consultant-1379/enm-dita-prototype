define(["dtdParts","traverser","domStuff"],function(parts,traverser,dom){
	var cm=parts.cm,
		allowedElements=parts.allowedElements,
		removedElements=parts.removedElements,
		modelAttributes=parts.modelAttributes,
		modelElements=parts.modelElements,
		IM=parts.IM,
		DTD=parts.DTD,
		DtdAttributes=parts.DtdAttributes,
		failNode=document.createElement("SPAN");
	failNode.setAttribute("_ditaname","XYXY");

	//	var cm="#CDATA";
	function parser() {
		var i=0,
			andType=1,orType=2,emptyType=3,one=1,oneOrMore=2,zeroOrMore=3,zeroOrOne=4,
			repeat=one,text="",strings=[],elements=[],nodes=[],
			currentNode=0,root=null,parseRoute=[],parseLevelStack=[],parseLevel=-1,expected=null,
			routeSoFar=null,theDTD=null,errorNode=-1,lastGoodNode=null;
		function getStatus(r) {
			var rec=r?r:{};
			rec.errorNode=errorNode;
			rec.lastGoodNode=lastGoodNode;
			rec.currentNode=currentNode;
			rec.expected=expected;
			rec.strings=strings;
			rec.routeSoFar=routeSoFar;
			return rec;
		}
		function pathTo(dtdNode,elementName) {
			var target=strings[elementName];
			for (var i=0;i<elements.length;i++) {
				if (!elements[i]) continue;
			}
		}
		function getElements() {
			return elements;
		}
		function getElement(str) {
			return elements[strings[str]];
		}
		function getElementList(group) {
			var list=[];
			var returnList=[];
			list.push(elements[getTerm(group)]);
			for (var i=0;i<list.length;i++) {
				if (list[i].list) {
					for (var i2=0;i2<list[i].list.length;i2++) {
						list.push(list[i].list[i2]);
					}
				} else {
					if (list[i].element) {
						var s=strings[list[i].element];
						if (returnList.indexOf(s)<0)
							returnList.push(s);
					}
				}
			}
			return returnList;
		}
		function getStrings() {
			return strings;
		}
		function parseElement(dtd) {
			var i=0,text="",cm=dtd;
			function parse() {
				function closeItem(group) {
					if (text.length>0) {
						addTerm(text,group);					
						text="";
					}
				}
				text="";
				var group=new aGroup();
				for (;i<cm.length;i++) {
					var ch=cm.charAt(i);
					switch (ch) {
					   case "(" :
						   i++;
						   group.list.push(parse());
						   break;
					   case ")" :
						   closeItem(group);
						   return group;
						   break;
					   case "," :
						   closeItem(group);
						   group.type=andType;
						   text=addTerm(text,group);
					   break;
					   case "|" : 
						   closeItem(group);
						   group.type=orType;
						   text=addTerm(text,group);
					   break;
					   case "*" : 
						   closeItem(group);
						   group.list[group.list.length-1].repeat=zeroOrMore;
					   break;
					   case "+" : 
						   closeItem(group);
						   group.list[group.list.length-1].repeat=oneOrMore;
					   break;
					   case "?" : 
						   closeItem(group);
						   group.list[group.list.length-1].repeat=zeroOrOne;
					   break;
					   default:
						   text=text+ch;
					   break;
					}
				}				
				closeItem(group);
				return group;
			}
			return parse();
		}
		function setDTD(dtd) {
			theDTD=dtd;
			for (var i2 in dtd) {
				var x=getTerm(i2);
				if (i2=="step"){
					console.log("step");
				}
				elements[x]=parseElement(dtd[i2]);
			}
			for (var i=0;i<allowedElements.length;i++) {
				var s=allowedElements[i];
				var x=removedElements.indexOf(s);
				if (x>-1) {
					removedElements.splice(x, 1);
				}
			}
			console.log(JSON.stringify(removedElements));
			trimTree(removedElements);
			numberTree();
		}
		function getTerm(s) {
			if (!(strings[s])) {
				var i=strings.length;
				strings[s]=i;
				strings[i]=s;
			}
			return strings[s];			
		}
		function aGroup(t) {
			this.type=andType;
			if (t!=undefined) {
				this.element=t;
			} else {
				this.list=[];				
			}
			this.repeat=one;			
		}
		function addTerm(s,g) {
			if (s.length>0) {
				if (s=="ANY") {
					;
				} if (s=="EMPTY") {
					delete g.list;
					g.type=emptyType;
				} else {
					g.list.push(new aGroup(getTerm(s)));				
				}
			}
			return "";
		}
		function numberTree() {
			var num=1;
			for (var i=0;i<elements.length;i++) {
				if (!elements[i]) continue;
				number(i,elements[i]);
			}
			function number(e,g) {
				g.id=num++;
				g.el=e;
				if (g.list) {
					for (var i=0;i<g.list.length;i++) {
						number(e,g.list[i]);
					}
				}
			}
		}
		function trimTree(exList) {
			for (var i=0;i<exList.length;i++) {
				elements[strings[exList[i]]]=undefined;
			}
			for (var i=0;i<elements.length;i++) {
				if (!elements[i]) continue;
				trimBranch(i);
			}
			function trimBranch(elx) {
				var pcdata=strings["#PCDATA"];
				if (elx==pcdata) return;
				var g=elements[elx];
				var allowed=[];
				if (!IM[strings[elx]]) console.log("No IM for "+strings[elx]);
				var imElements=IM[strings[elx]]?IM[strings[elx]]:[];
				for (var i=0;i<imElements.length;i++) {
					allowed.push(strings[imElements[i]]);
				}
				if (!g) return;
				var modified=true;
				while (modified) {
					modified=false;
					trim(g);
				}
				function trim(t) {
					if (!t) return;
					if (!t.list) return;
					for (var i=0;i<t.list.length;i++) {
						if (t.list[i] && t.list[i].element && t.list[i].element!=pcdata && allowed.indexOf(t.list[i].element)<0) {
							t.list[i]=undefined;
							modified=true;
						} 
						if (t.list[i] && t.list[i].list && t.list[i].list.length==0) {
							t.list[i]=undefined;
							modified=true;
						} 
					}
					var newList=[];
					for (var i=0;i<t.list.length;i++) {
						if (t.list[i]==undefined) continue;
						newList.push(t.list[i]);
					}
					if (newList.length<t.list.length) {
						t.list.length=0;
						modified=true;
						for (var i=0;i<newList.length;i++) {
							t.list.push(newList[i]);
						}							
					}
					for (var i=0;i<t.list.length;i++) {
						trim(t.list[i]);
					}
				}
			}
			for (var i=0;i<elements.length;i++) {
				if (!elements[i]) continue;
				console.log(strings[i]+"="+outputParseTree(elements[i])+"\r\n");
			}
			numberTree();
		}
		function outputParseTree(group) {
			var list=group.list;
			var start="",end="";
			var str=[];
			var sep=["",",","|"]
			var repeat=["","","+","*","?"];
			var thisSep="";
			if (group.type==emptyType) {
				return "EMPTY";
			}
			if (!list) {
				return strings[group.element]+repeat[group.repeat];
			}
			str.push("(");
			for (var i=0;i<list.length;i++) {
				str.push(thisSep);
				str.push(outputParseTree(list[i]));
				thisSep=sep[group.type];
			}
			str.push(")");
			str.push(repeat[group.repeat]);
			return str.join("");
		}
		function parseNode(dtdNode) {
//			var andType=1,orType=2,one=1,oneOrMore=2,zeroOrMore=3,zeroOrOne=4;
            var str=outputParseTree(dtdNode);
            var r=false;
			switch (dtdNode.repeat) {
			case 1:
			case 4:
				r=validate(dtdNode);
				if (dtdNode.repeat==4) r=true;
				break;
			case 2:
				r=validate(dtdNode);
				if (!r) return r;
			case 3:
				while (validate(dtdNode)) ;
				r=true;
				break;
			}
			return r;
		}
		function startValidation(x) {
			expected=null;
			return validateNode(new aGroup(x));
		}
		function validateNode(dtdNode) {
			function popAndReturn(p1) {
				var e=parseRoute.pop();
				return p1;
			}
			parseRoute.push(dtdNode);
			if (nodes[currentNode]==WHITESPACE) {
				if (dtdNode.element!=PCDATA) {
					currentNode++; 
				} else {
					nodes[currentNode]==PCDATA;
				}	
			}
			var cn=strings[Math.abs(nodes[currentNode])];
			var pn=strings[Math.abs(dtdNode.element)];

			if (nodes[currentNode]!=dtdNode.element) {
				if (parseLevelStack[parseLevel]==null) {
					parseLevelStack[parseLevel]=[];
				}
				parseLevelStack[parseLevel].push(dtdNode.element);
				return popAndReturn(false);
			} else {
				lastGoodNode=dtdNode;
				parseLevelStack[parseLevel]=null;
			}
			var element=elements[nodes[currentNode]];
			currentNode++;
			if (element.type==emptyType) {
				if (nodes[currentNode]==0-dtdNode.element) {
					currentNode++;
				}
			} else {
				parseLevel++;
				console.log("+"+strings[dtdNode.element]);
				var r=parseNode(elements[dtdNode.element]);
				if (nodes[currentNode]==0-dtdNode.element) {
					if (!r) {
						report();
					}
					parseLevelStack[parseLevel]=null;
					console.log("-"+strings[Math.abs(nodes[currentNode])]);
					currentNode++;
					while (nodes[currentNode]==0 && nodes[currentNode]==WHITESPACE) {
						currentNode++;
					}
				} else {
					console.log("???"+strings[Math.abs(nodes[currentNode])]);
					report();
					r=false;
				}
				parseLevel--;
				return popAndReturn(r);
			}
			return popAndReturn(true);
		}
		function report() {
			if (expected!=null) return;
			expected=[];
			routeSoFar=parseRoute.concat();
			errorNode=currentNode;
			for (var i=0;parseLevelStack[parseLevel] && i<parseLevelStack[parseLevel].length;i++) {
				expected.push(parseLevelStack[parseLevel][i]);
			}
		}
		function validate(dtdNode) {
//			var andType=1,orType=2,one=1,oneOrMore=2,zeroOrMore=3,zeroOrOne=4;
            var r=false;
			if (dtdNode.list) {
	            var list=dtdNode.list;
				if (dtdNode.type==orType) {
					for (var i=0;i<list.length;i++) {
						if (parseNode(list[i])) {
							return true;
						}
					}
					return false;
				} else {
					for (var i=0;i<list.length;i++) {
						if (!parseNode(list[i])) {
							return false;
						}
					}
					return true;
				}
			} else {
				return validateNode(dtdNode);
			}
		}
		function realData(s) {
			for (var i=0;i<s.length;i++) {
				if (s.charCodeAt(i)<=32) continue;
				return true;
			}
			return false;
		}
		function checkModel(p) {
			if (p.list) {
				for (var i=0;i<list.length;i++) {
					if (p.list[i].element) {
						if (modelElements.indexOf(strings[p.list[i].element])<0) {
							p.list.splice(i,1);
							i--;
							continue;
						}
					} else {
						checkModel(p.list[i]);
					}
				}
			}
		}
		function parseContentList(list) {
			i=0;
			parseRoute=[];
			currentNode=0;
			parseLevelStack=[];
			parseLevel=-1;
			expected=null;
			var ret=list2elementList(list);
			nodes=ret.elementList;
			root=nodes[0];
			startValidation(root);
		}
		function parseFrom(p,insertPoint) {
			var top=p.parentNode;
			top.insertBefore(failNode,insertPoint);
			var list=htmlNodeList(top);
			failNode.parentNode.removeChild(failNode);
			parseContentList(list);
			return getStatus();
		}

		function htmlSelection(sel,suggest,stopNode) {
			if (!(sel && sel.anchorOffset)) return;
			var p=(sel.ancestor?sel.ancestor:sel.anchorNode.parentNode),selParts=[],str,startNode;
			str=sel.anchorNode.nodeValue;
			selParts.push(str.substring(0,sel.anchorOffset));
			if (sel.sameNode) {
				selParts.push(str.substring(sel.anchorOffset,sel.focusOffset));
				selParts.push("");
				selParts.push(str.substring(sel.focusOffset));
			} else {
				selParts.push(str.substring(sel.anchorOffset));
				str=sel.focusNode.nodeValue;
				selParts.push(str.substring(0,sel.focusOffset));
				selParts.push(str.substring(sel.focusOffset));
			}
			var list=[],ditaname;
			if (p.nodeType!=1) p=p.parentNode;
			traverser.nodeTraverser(p,function(node,start){
				if (start) {
					switch (node.nodeType) {
						case 1: if (ditaname=node.getAttribute("_ditaname")) {
							node.setAttribute("__nn",list.length);
							if (stopNode==node) {
								list.push(startNode={nodeName:suggest,nodeType:1});
							}
							list.push({nodeName:ditaname,nodeType:node.nodeType});
						} break;
						case 3: 
						if (node==sel.anchorNode) {
							if (selParts[0]) {
								list.push({nodeName:node.nodeName,nodeValue:selParts[0],nodeType:node.nodeType});
							}
							list.push(startNode={nodeName:suggest,nodeType:1});
							if (selParts[1]) {
								list.push({nodeName:node.nodeName,nodeValue:selParts[1],nodeType:node.nodeType});
							}
						}
						if (node==sel.focusNode) {
							if (selParts[2]) {
								list.push({nodeName:node.nodeName,nodeValue:selParts[2],nodeType:node.nodeType});
							}
							list.push(startNode.endNode={startElement:startNode,nodeName:suggest,nodeType:-1});
							if (selParts[3]) {
								list.push({nodeName:node.nodeName,nodeValue:selParts[3],nodeType:node.nodeType});
							}
						}
						break;
					}
				} else {
					switch (node.nodeType) {
						case 1: if (ditaname=node.getAttribute("_ditaname")) {
							list.push({startElement:list[node.getAttribute("__nn")],nodeName:ditaname,nodeType:-1});
							list[node.getAttribute("__nn")].endNode=list[list.length-1];
							node.removeAttribute("__nn");
						} break;
					}
				}
			});
			parseContentList(list);
		}
		function htmlNodeList(p) {
			var list=[],ditaname;
			traverser.nodeTraverser(p,function(node,start){
				if (start) {
					switch (node.nodeType) {
						case 1: if (ditaname=node.getAttribute("_ditaname")) {
							node.setAttribute("__nn",list.length);
							list.push({nodeName:ditaname,nodeType:node.nodeType,orig:node});
						} break;
						case 3: {
							list.push({nodeName:node.nodeName,nodeValue:node.nodeValue,nodeType:node.nodeType,orig:node});
						}
						break;
					}
				} else {
					switch (node.nodeType) {
						case 1: if (ditaname=node.getAttribute("_ditaname")) {
							list.push({startElement:list[node.getAttribute("__nn")],nodeName:ditaname,nodeType:-1});
							list[node.getAttribute("__nn")].endNode=list[list.length-1];
							node.removeAttribute("__nn");
						} break;
					}
				}
			});
			return list;
		}
		function xmlToList(content) {
			var list=[],xml=dom.domParser.parseFromString(content,"text/xml");
			traverser.nodeTraverser(xml,function(node,start){
				if (start) {
					switch (node.nodeType) {
						case 1: node.setAttribute("__nn",list.length);
								list.push({nodeName:node.nodeName,nodeType:node.nodeType}); break;
						case 3: list.push({nodeName:node.nodeName,nodeValue:node.nodeValue,nodeType:node.nodeType}); break;
					}
				} else {
					switch (node.nodeType) {
						case 1: list.push({startElement:list[node.getAttribute("__nn")],nodeName:node.nodeName,nodeType:-1});
						list[node.getAttribute("__nn")].endNode=list[list.length-1];
						node.removeAttribute("__nn");
						break;
					}
				}
			});
			return list;
		}
		function list2elementList(list) {
			var elementList=[],root=null;
			for (var i=0;i<list.length;i++) {
				if (list[i].nodeType==1) {
					var n=getTerm(list[i].nodeName);
					elementList.push(n);
					root=root?root:n;
				}
				if (root==null) continue;
				if (list[i].nodeType==-1) elementList.push(0-getTerm(list[i].startElement.nodeName));
				if (list[i].nodeType==3) {
					if (realData(list[i].nodeValue)) {
						elementList.push(PCDATA);
					} else {
						elementList.push(WHITESPACE);
					}
				}
			}
			return {root:root,elementList:elementList};
		}
		function parseContent(xml) {
			i=0;
			parseRoute=[];
			currentNode=0;
			root=null;
			parseLevelStack=[];
			parseLevel=-1;
			expected=null;

			var list=xmlToList(xml);
			var ret=list2elementList(list);
			root=ret.root;
			nodes=ret.elementList;
			if (nodes.length==0||root==null) {
				return;
			}
			currentNode=0;
			startValidation(root);
		}
		function readDom(node,list) {
			if (node.nodeType==1) {
				var xmlNode=(node.className!=null&&node.className.length>0);
				var elementName=node.className;
				var elNameSpace=elementName.indexOf(" ");
				if (elNameSpace>-1) {
					elementName=elementName.substring(0,elNameSpace);
				}
				var n=getTerm(elementName);
				if (xmlNode) list.push(n);
				for (var i=0;i<node.childNodes.length;i++) {
					readDom(node.childNodes[i],list);
				}
				if (xmlNode) list.push(0-n);
			} else if (node.nodeType==3) {
				list.push(PCDATA);
			}
		}
		var WHITESPACE=getTerm("#WHITESPACE");
		var PCDATA=getTerm("#PCDATA");
		var ANY=getTerm("ANY");
		var EMPTY=getTerm("EMPTY");
		elements[PCDATA]=new aGroup(PCDATA);
		elements[PCDATA].type=emptyType;
		setDTD(DTD);
		return {setDTD:setDTD,parseContent:parseContent,parseContentList:parseContentList,getStatus:getStatus,
		htmlSelection:htmlSelection,htmlNodeList:htmlNodeList,failNode:failNode,parseFrom:parseFrom};
	}
	return parser();
});
