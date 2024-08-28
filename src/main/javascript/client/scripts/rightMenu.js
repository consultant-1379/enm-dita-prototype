define(["traverser","button","Html2Xml","ajax","keyboard","acrolinx","directory","words","keys","domStuff"],function(traverser,button,h2x,ajax,keyb,acrolinx,directory,words,keys,domStuff){
	var sel,
		buttons={},
		func={
			"Save":function(e){
				if (sel.focusNode) {
					var resp=h2x.exportTopic(sel.focusNode),
					retRec={};
					retRec.exportResp=resp;
					function getMd5Key(res,fn) {
						function handleKeyFile(param) {
							res.exportMd5Keyfile=JSON.parse(param);
							fn(res);
						}
						ajax.getFile(res.exportResp.md5,handleKeyFile);
					}
					function storeMap(res) {
						function handleKeyFile(param) {
							res.exportMap=param;
							alert("hi");
						}
						ajax.getFile(res.exportMd5Keyfile.repomap,handleKeyFile);
					}
//					getMd5Key(retRec,storeMap);
					resp.filename="tests\\abc.def";
					var meta=resp.meta={md5:resp.md5};
					meta.encoding="utf8";
					ajax.ajaxPost("/post",JSON.stringify(resp),function(ret){
						var retVal=JSON.parse(ret);
						updateRepoMap(retVal.md5,retVal.key);
						var newMap=getKeyRepoMap(retVal.md5),
							mapData=domStuff.serializer.serializeToString(newMap);
						delete resp.md5;
						ajax.ajaxPost("/post",JSON.stringify(resp),function(){
							resp.filename="tests\\repomap.map";
							resp.data=mapData;
							ajax.ajaxPost("/post",JSON.stringify(resp),function(){alert("saved id="+retVal.md5+" new sha1:"+retVal.key)});
						});
					});
					var d=document.getElementById("filedialog");
					d.style.display="none";
				}
			},
			"New":function(e){
				words.testInlineMarkup();
				alert(e.target.textContent);
				var d=document.getElementById("filedialog");
				d.style.display="none";
			},
			"Acrolinx":function(e){
				acrolinx.run();
				var d=document.getElementById("filedialog");
				d.style.display="none";
			},
			"Validate":function(e){
				var d=document.getElementById("filedialog");
				d.style.display="none";
				var a=repos;
			}
		};
	function updateRepoMap(md5,p) {
		var repos=directory.repomaps,b;
		for (var a in repos) {
			var xml=repos[a],
			    node=xml.querySelector("keydef[keys='"+md5+"']");
			if (!node) continue;
			node.setAttribute("href",p);
			return;
		}
	}
	function getKeyRepoMap(md5) {
		var repos=directory.repomaps,b;
		for (var a in repos) {
			var xml=repos[a],
			    node=xml.querySelector("keydef[keys='"+md5+"']");
			if (node) return xml;
		}
	}
	function fileClick(e) {
		sel=button.getSelection();
		var d=document.getElementById("filedialog");
		if (d.style.display!="block") {
			d.style.display="block";
		} else {
			d.style.display="none";
		}
	}
	function keyboard(e) {
		if (e.code=="Escape") {
			var d=document.getElementById("filedialog");
			d.style.display="none";
		}
	}
	function init() {
		keyb.downSet["fileMenu"]=keyboard;
		var d=document.getElementById("filedialog");
		for (var i in func) {
			d.appendChild(createButton(i));
		}		
		d=document.getElementById("buttonFile");
		d.onclick=fileClick;
	}
	function createButton(txt) {
		var d=document.createElement("DIV"),
			b=document.createElement("BUTTON"),
			t=document.createTextNode(txt),
			id="right."+txt;
			d.appendChild(b);
			b.appendChild(t);
	    b.setAttribute("id",id);
		b.onclick=func[txt];
		return d;
	}
	
	return {
		init:init
	}
});