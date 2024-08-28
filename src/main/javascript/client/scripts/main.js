requirejs(["getParameters","Xml2Html","ajax","DomStuff","MapProcessor","readBookmap","keys","mainHtml","parser"],
   function(parameters,x2h,Ajax,dom,mapProcessor,readBookmap,keys,mainHtml,parser){
/*
"dl","ol","ul","fig","imagemap","image","note","table","hazardstatement","codeblock",
"xref","cite","option","codeph","uicontrol","cmdname","varname","parmname","term","filepath","systemoutput","userinput","tm","sub","sup","ph",
"abbreviated-form","draft-comment","fn"
*/
	function setup() {
		mainHtml.init();
		return;
	}
	function getKey(key,fn) {
		function ret(data) {
			fn(JSON.parse(data));
		}
		getFile(key,ret);
	}
	function getFile(key,fn) {
		Ajax.getFile(key,fn);
	}
	function getXml(key,fn) {		
		function ret(obj) {
			getFile(obj.key,fn);
		}
		getKey(key,ret);
	}
	Ajax.ajax("../repo/repo.map",function (ans) {
		var map=JSON.parse(""+ans);
		var base=dom.domParser.parseFromString("<map></map>", "text/xml");
		var baseScope=0;
		for (var i in map) {
			var keydef=base.createElement("keydef");
			keydef.setAttribute("keys",i);
			keydef.setAttribute("href",map[i]);
			keys.addKey(baseScope,i,keydef);
		}
		readBookmap.getMap(parameters.map,(ans)=>{
			mapProcessor.processMap(ans);
		});
	});
	setup();
});