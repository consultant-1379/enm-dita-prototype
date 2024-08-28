define(["parser","dtdParts"]],function(parser,dtdParts){
	parser.setDtd(dtdParts.cm);
	//myParser.parseContent("<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<!DOCTYPE task PUBLIC \"-//OASIS//DTD DITA Task//EN\"\r\n \"../../dtd/technicalContent/dtd/task.dtd\">\r\n<!-- This file is part of the DITA Open Toolkit project hosted on \r\n     Sourceforge.net. See the accompanying license.txt file for \r\n     applicable licenses.-->\r\n<!-- (C) Copyright IBM Corporation 2001, 2005. All Rights Reserved.\r\n *-->\r\n<task id=\"changeoil\" xml:lang=\"en-us\">\r\n<title>Changing the oil in your car</title><shortdesc>Once every 6000 kilometers or three months, change the oil in\r\nyour car.</shortdesc><taskbody>\r\n<context><p>Changing the oil regularly \r\nwill help keep the engine in good condition. </p></context>\r\n<steps>\r\n<stepsection>To change the oil:</stepsection>\r\n<step><cmd>Remove the old oil filter.</cmd></step>\r\n<step><cmd>Drain the old oil.</cmd></step>\r\n<step><cmd>Install a new oil filter and gasket.</cmd></step>\r\n<step><cmd>Add new oil to the engine.</cmd></step>\r\n<step><cmd>Check the air filter and replace or clean it.</cmd></step>\r\n<step><cmd>Top up the windshield washer fluid.</cmd></step>\r\n</steps>\r\n</taskbody>\r\n<related-links>\r\n<link href=\"../concepts/oil.xml\" format=\"dita\" type=\"concept\"></link>\r\n<link href=\"../concepts/wwfluid.xml\" format=\"dita\" type=\"concept\"></link><titlealts></titlealts></related-links></task>");
	parser.parseContent("<tgroup><x></x></tgroup>");

	var inlineIcons=["codeblock","parmname","codeph","cmdname","filepath","systemoutput","userinput","uicontrol","varname","ph","sup","sub",
					 "sl","ul","ol","dl","fig","image","table","fn","note","hazardstatement","cite","xref","option","tm","imagemap","draft-comment",
					 "keyword","term","indexterm","data"];
	var p=myParser.getElement("p");
	var inlineElements=myParser.getElementList("p");
	var strings=myParser.getStrings();
	var hierarchy=[];
	var currentErrorList=[];
	var checkErrorList=[];
	var PCDATA=strings.indexOf("#PCDATA");
	var pStatus={};
	var buildFollowers=function() {
		for (var s1=0;s1<strings.length;s1++) {
			s=strings[s1];
			if (allowedElements.indexOf(s)>-1) {
				hierarchy[s1]={follower:[],parent:[]};
				myParser.parseContent("<"+s+"><x></x></"+s+">");
				var status=myParser.getStatus(pStatus);
				var expected=status.expected;
				if (expected!=null) {
					for (var i=0;i<expected.length;i++) {
						var str=strings[expected[i]];
						if (str=="#PCDATA" || allowedElements.indexOf(str)>-1) {
							hierarchy[s1].follower.push(expected[i]);
						}
					}
				}		
			}
		}	
	}
	buildFollowers();

	for (var s1=0;s1<strings.length;s1++) {
		s=strings[s1];
		if (s=="#PCDATA" || allowedElements.indexOf(s)>-1) {
			if (!hierarchy[s1])
				hierarchy[s1]={follower:[],parent:[]};
			var f=hierarchy[s1].follower;
			for (var i=0;i<f.length;i++) {
				if (!hierarchy[f[i]])
					hierarchy[f[i]]={follower:[],parent:[]};
				var l=hierarchy[f[i]].parent;
				if (l.indexOf(s1)<0) l.push(s1)
			}
		}
	}

	var parentsNonText=function(n) {
		var r=[];
		if (!hierarchy[n]) return r;
		var list1=hierarchy[n].parent;
		for (var i1=0;i1<list1.length;i1++) {
			if (!hierarchy[list1[i1]]) continue;
			if (allowedElements.indexOf(strings[list1[i1]])<0) continue;
			var list2=hierarchy[list1[i1]].parent;
			for (var i2=0;i2<list2.length;i2++) {
				if (!hierarchy[list2[i2]]) continue;
				var f=hierarchy[list2[i2]].follower;
				if (f.indexOf(PCDATA)<0) r.push(list2[i2]);
			}
		}
		return r;
	}
	var rootList=[];
	for (var s1=0;s1<strings.length;s1++) {
		var r=parentsNonText(s1);
		for (var i=0;i<r.length;i++) {
			if (rootList.indexOf(r[i])<0) {
				rootList.push(r[i]);
			}
		}
	}
	var list2=[];
	for (var s1=0;s1<rootList.length;s1++) {
		if (rootList[s1]<0) continue;
		var f=hierarchy[rootList[s1]].follower;
		for (var s2=0;s2<f.length;s2++) {
			if (rootList.indexOf(f[s2])>-1 && f[s2]!=rootList[s1]) {
				if (list2.indexOf(f[s2])<0 && inlineElements.indexOf(strings[f[s2]])<0) {
					console.log("for "+strings[rootList[s1]]+" remove "+strings[f[s2]]);
					list2.push(f[s2]);
				}
			}
		}
	}
	for (var s1=0;s1<rootList.length;s1++) {
		console.log("-"+strings[rootList[s1]]);
	}
	for (var s1=0;s1<list2.length;s1++) {
		rootList.splice(rootList.indexOf(list2[s1]),1);
	}
	for (var s1=0;s1<rootList.length;s1++) {
		console.log(strings[rootList[s1]]);
	}

	//var groups=.parse();
	//var str=p.outputParseTree(groups);
	//console.log(str);

	function myFn(){
		var buttons=[];
		var INLINE=1;
		var BLOCK=2;
		var TREE=3;
		var INLINEBLOCK=4;
		var currentButton=undefined;
		var errorText=document.getElementById("errorText");
		
		function buttonClicked(e) {
			var rec=buttons[this.id];
			if (rec&&rec.click) {
				rec.click(rec);
			}
		}
		function doAlert(button) {
			var sel=window.getSelection();
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
					var p1=sel.anchorOffset;
					var p2=sel.focusOffset;
					parent.removeChild(pos);
					if (p1>0) {
						nodes.push(document.createTextNode(text.substring(0,p1)));
					}
					var types=["","SPAN","DIV","DIV","DIV"];
					var node=document.createElement(types[button.type]);
					node.className=button.id;
					nodes.push(node);
					node.appendChild(document.createTextNode(text.substring(p1,p2)));
					if (p2<text.length) {
						nodes.push(document.createTextNode(text.substring(p2,text.length)));
					}
					for (var i=0;i<nodes.length;i++) {
						parent.appendChild(nodes[i]);
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
		function buttonFactory(txt,type) {
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
		var inlineButtonsDiv=document.getElementById("inlineButtons");
		var blocks=document.getElementById("blockButtons");
		var inlineBlock=[];
		var inlinetmp=[];
		var others=[];
		for (var i=0;i<strings.length;i++) {
			if (inlineElements.indexOf(strings[i])<0) continue;
			if (hierarchy[i]==undefined) continue; 
			if (hierarchy[i].follower.indexOf(strings["#PCDATA"])<0) {
				inlineBlock.push(i);
				continue;
			}
			inlinetmp.push(i);
		}
		for (var i=0;i<strings.length;i++) {
			if (inlineElements[i]=="#PCDATA") {
				continue;
			}
			if (allowedElements.indexOf(strings[i])<0) {
				continue;
			}
			if (inlineBlock.indexOf(i)>-1) {
				inlineButtonsDiv.appendChild(new buttonFactory(strings[i],INLINEBLOCK));
				continue;
			}
			if (inlinetmp.indexOf(i)>-1) {
				continue;
			}
			if (hierarchy[i]==undefined)  {
				others.push(i);
				continue;
			}
			if (hierarchy[i].follower.indexOf(strings["#PCDATA"])<0) {
				others.push(i);
				continue;
			}
			blocks.appendChild(new buttonFactory(strings[i],BLOCK));
			blocks.appendChild(document.createElement("BR"));
		}
		for (var i=0;i<inlinetmp.length;i++) {
			inlineButtonsDiv.appendChild(new buttonFactory(strings[inlinetmp[i]],INLINE));
		}
		for (var i=0;i<others.length;i++) {
			blocks.appendChild(new buttonFactory(strings[others[i]],TREE));
			blocks.appendChild(document.createElement("BR"));
		}

		
		var addElement=function(x){
			var el=document.createElement("DIV");
			el.className=x;
			return el;
		} 
		var htmlList=[];
		var htmlToXml=function(x){
			var xml=[];
			htmlList=[];
			function listNode(n) {
				var idx=htmlList.length;
				htmlList.push(n);
				if (n.nodeType==3) {
					xml.push(n.nodeValue);
					return;
				}
				xml.push("<"+n.className+">");
				for (var i=0;i<n.childNodes.length;i++) {
					listNode(n.childNodes[i]);
				}
				htmlList.push({nodeType:-1,index:idx});
				xml.push("</"+n.className+">");
			}
			listNode(x);
			return xml.join("");
		}

		var shortestPathTo=function(x,y,l){
			var from={next:y};
			var parents=hierarchy[y].parent;
			for (var i=0;i<parents.length;i++) {
				if (parents[i]==x) {
				} 
			}
		}

		
		var xmlBody=document.getElementById("htmlXml");
		var step1=function(){
			if (xmlBody.childNodes.length==0) {
				xmlBody.appendChild(addElement("task"));
				return step1();
			}
			var xml=htmlToXml(xmlBody.childNodes[0]);
			myParser.parseContent(xml);
			var status=myParser.getStatus(pStatus);
			var expected=status.expected;
			if (expected!=null && expected.length>0) {
				var newEl=addElement(strings[expected[0]]);
				if (htmlList[status.errorNode].nodeType==-1) {
					htmlList[htmlList[status.errorNode].index].appendChild(newEl);
				} else {
					var n=htmlList[status.errorNode].parentNode;
					n.insertBefore(newEl,htmlList[status.errorNode]);
				}
			}
			var l=expected;
			setInterval(timedLoop, 500);
		}
		
		var getCaret = function() {
			sel=window.getSelection();
			return sel.anchorNode;
		}
		var updateFormatting=function(){
			var node=document.getElementById("htmlXml");
			var list=[];
			list.push(node);
			for (var i=0;i<list.length;i++) {
				if (list[i].nodeType==1 && list[i].childNodes.length > 0) {
					var children=list[i].childNodes;
					for (var i2=0;i2<children.length;i2++) {
						list.push(children[i2]);
					}
				}
			}
			var count=0;
			for (var i=0;i<list.length;i++) {
				if (list[i].nodeType==1) {
					if (list[i].className=="step") {
						count++;
						var val=""+count+".";
						var style=list[i].getAttribute("style");
						if (style==val) continue;
						list[i].setAttribute("stepno",val);
					}
				}
			}
		}
		var setCurrentButton=function(){
			var caret=window.getSelection().anchorNode;
			if (caret==undefined) return;
			if (caret==currentButton) return; 
			if (currentButton!=undefined) {
				var i=currentButton.className.indexOf("S");
				if (i>0) currentButton.className=currentButton.className.substring(0,i);
			}
			var node=caret.parentNode.className.split(" ")[0];
			var button=document.getElementById("button."+node);
			if (button==undefined) return;
			currentButton=button;
			currentButton.className=currentButton.className+"S";
		}

		
		var csmTitleCase=(function(){
			var stopWords={"a":true, "an":true, "and":true, "as":true, "at":true, "but":true, "by":true, "down":true, "for":true, "from":true, "in":true, "into":true, "nor":true, "of":true, "on":true, "onto":true, "or":true, "over":true, "so":true, "the":true, "till":true, "to":true, "up":true, "via":true, "with":true, "yet":true};
			function chType(ch) {
				if (ch>='A' && ch <='Z') return 1;
				if (ch>='a' && ch <='z') return 2;
				if (ch==' ' || ch=='\u00A0' || ch=='\t') return 3;
				if (ch=="\'" || ch=="\"") return 4;
				if (ch=="(" || ch=="[" || ch=="<" || ch=="{") return 5;
				if (ch==")" || ch=="]" || ch==">" || ch=="}") return 6;
				if (ch=="," || ch=="." || ch=="/" || ch=="!" || ch=="?") return 6;
				if (ch=="-" || ch=="_") return 7;
				return 4;
			};
			function titleCase(word) {
				if (word==null) return word;
				var count=0;
				for (var i=0;i<word.length;i++) {
					if (chType(word.charAt(i))==1) count++;
				}
				if (count>1) return word;
				if (word.length==1) return word.toUpperCase();
				var r=word.toLowerCase();
				return (""+r.charAt(0)).toUpperCase()+r.substring(1,r.length);
			};
			var getWordList=this.getWordList=function(string) {
				var word="";
				var words=[];
				var start=0;
				for (var i=0;i<string.length;i++) {
					var ch=string.charAt(i);
					var t=chType(ch);
					var letter=t<3
					if (letter) {
						if (word.length==0) start=i;
						word=word+ch;
					} else {
						if (word.length>0) {
							if (ch=='\'' && i+1<string.length && chType(string.charAt(i+1))<3) {
								word=word+ch;
								continue;
							}
							words.push({word:word,start:start,end:i});
							word="";
						}
					}
				}
				if (word.length>0) {
					words.push({word:word,start:start,end:string.length});			
				}
				return words;
			};
			var checkTitleCase=this.checkTitleCase=function(title) {
				words=getWordList(title);
				for (var i=0;i<words.length;i++) {
					word=words[i].word;
					var tcWord=titleCase(word);
					if (i==0 || i==words.length-1) {
						if (word!=tcWord) {
							words[i].expected=tcWord;
						}
						continue;
					}
					var lcWord=word.toLowerCase();
					if (stopWords[lcWord]) {
						if (word!=lcWord) {
							words[i].expected=lcWord;
						}
						continue;
					}
					if (word!=tcWord) {
						words[i].expected=tcWord;
					}
				}
				var i2=0;
				var r="";
				for (var i=0;i<words.length;i++) {
					for (var i3=i2;i3<words[i].start;i3++) {
						r=r+title.charAt(i3);
					}
					if (words[i].expected) {
						r=r+words[i].expected;
					} else {
						r=r+words[i].word;
					}
					i2=words[i].end;
				}
				for (var i3=i2;i3<title.length;i3++) {
					r=r+title.charAt(i3);
				}
				return r;
			}
			return this;
		})();	
		
		var getNodesByClass=function(n,start){
			var p=start?start:xmlBody;
			var list=[];
			var r=[];
			list.push(p);
			for (var i=0;i<list.length;i++) {
				p=list[i];
				if (p.className==n) {
					r.push(p);
				}
				if (p.nodeType==1) {
					for (var i2=0;i2<p.childNodes.length;i2++) {
						list.push(p.childNodes[i2]);
					}
				}
			}
			return r;
		};

		var getText=function(node){
			var text=[];
			function get(p) {
				if (p.nodeType==3) {
					text.push(p.nodeValue);
				}
				if (p.nodeType==1) {
					var children=p.childNodes;
					for (var i=0;i<children.length;i++) {
						get(children[i]);
					}
				}
			}
			get(node);
			return text.join("");
		};

		var getTaskTitle=function(){
			var list=getNodesByClass("title");
			if (list.length>0 && list[0].parentNode && list[0].parentNode.className=="task") {
				return getText(list[0]); 
			}
			return "";
		};
		
		var reportError=function(e){
			checkErrorList.push(e);
		};
		var displayErrors=function(){
			var e1=currentErrorList.join(";");
			var e2=checkErrorList.join(";");
			var nodes=[];
			if (e1!=e2) {
				for (var i=0;i<errorText.childNodes.length;i++) {
					nodes.push(errorText.childNodes[i]);
				}
				for (var i=0;i<nodes.length;i++) {
					for (var i2=0;i2<nodes[i].childNodes.length;i2++) {
						nodes.push(nodes[i].childNodes[i2]);
					}
				}
				for (var i=nodes.length-1;i>=0;i--) {
					nodes[i].parentNode.removeChild(nodes[i]);
				}
				for (var i=0;i<checkErrorList.length;i++) {
					errorText.appendChild(document.createTextNode(checkErrorList[i]));
					errorText.appendChild(document.createElement("BR"));
				}
				while (currentErrorList.length>0) {
					currentErrorList.pop();
				}
				for (var i=0;i<checkErrorList.length;i++) {
					currentErrorList.push(checkErrorList[i]);
				}
			}
		};
		
		var checkTitle=function(){
			var title=getTaskTitle();
			if (title==null || title.length==0) {
				reportError("Topic title not set");
				return;
			}
			var x=csmTitleCase.checkTitleCase(title);
			if (x!=title) {
				reportError("CSM: Topic title not in Title Case expected: "+x);
				return;			
			}
		};
		
		var corporateStyleManual=function(){
			var title=checkTitle();
		}
		var xmlStructure=function(){
			var list=[];
			myParser.readDom(xmlBody.childNodes[0],list);
			myParser.parseContentList(list);
			var status=myParser.getStatus(pStatus);
			var expected=status.expected;
			if (expected!=null && expected.length>0) {
				var str="XML: ";
				var sep="";
				for (var i=0;i<expected.length;i++) {
					str=str+sep+strings[expected[i]];
					sep=", ";
				}
				reportError(str);
			}
		}
		var timedLoop=function(){
			while (checkErrorList.length>0) {
				checkErrorList.pop();
			}
			setCurrentButton();
			updateFormatting();
			corporateStyleManual();
			xmlStructure();
			displayErrors();
		}

		step1();
	//<div style="position:relative;" class="task"><div class="title">Task Title</div><div class="p">List item a</div><div class="p">List item 2 <span class="tm tm_tm">Trademark</span> <span class="tm tm_reg">Reg</span> sup<span class="sup">xxx</span> sub<span class="sub">xxx</span> CCC</div><div class="p">Babc <span class="filepath">/etc/tmp/abc.xyz</span> <span class="xref">http://www.ericsson.com</span></div></div>
	};
	</script>
	<title>
	</title>
	</head>
	<body onload="myFn()">
	<div style="position:relative;" id="inlineButtons"></div>
	<div style="position:relative;">
	<div id="errorMessages" style="position:absolute;right:0pt;top:0pt;padding:4px; border: 2px solid red;width:300px;font-family:sans-serif;font-size:10pt;vertical-align:top;color:blue;"><span style="color:black;text-style:bold;">Errors</span><br/><br/><span id="errorText"></span></div>
	<div id="blockButtons" style="position:absolute;left:0pt;top:0pt;width:200pt;"></div>
	<div id="htmlXml" contenteditable="true" style="word-wrap: keep-all;width:600pt;display:inline; position:absolute;left:90pt;top:0pt;"><div style="position:relative;" class="task"><div class="title">FM HeartbeatTimeout and Automatic Synchronization Configuration for ENodeB</div><div class="shortdesc">This section describes about FM Heartbeat Timeout and Automatic Synchronization Configuration for ENodeB for Fault Management(FM).</div><div class="taskbody"><div class="steps"><div class="stepsection">Steps to change Heartbeat Timeout, Automatic Synchronization Configuration</div><div class="step"><div class="cmd">To change Heartbeat Timeout use the commands in the cli app center available at below url</div><div class="stepxmp">https://&lt;apache_host_name&gt;/#help/app/cliapp/concept/tutorials_fmedit/SetHeartBeatData</div><div class="stepxmp">where &lt;apache_host_name&gt; is your httpd host name</div></div><div class="step"><div class="cmd">To change Automatic Synchronization use the commands in the cliapp center available at below url:</div><div class="stepxmp">https://&lt;apache_host_name&gt;/#help/app/cliapp/concept/tutorials_fmedit/SetAutoSynchData</div><div class="stepxmp">where &lt;apache_host_name&gt; is your httpd host name</div></div><div class="step"><div class="cmd">Disable and Enable Alarm Supervision from CLI or AlarmMonitor App on the network elememts for which the changes are made to get the updated values for heartbeat time out and automatic synchronization to be effective.</div></div></div><div class="result"><div class="p">Changes in HeartbeatTimeout, Automatic synchronization for the selected ENodeB(s) is applied.</div></div></div></div></div></div>
	</body>
	</html>

});