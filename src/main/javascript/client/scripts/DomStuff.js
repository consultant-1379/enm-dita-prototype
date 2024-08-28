define(function(){
	var domParser = new DOMParser(),
		document = domParser.parseFromString("<map></map>", "text/xml"),
		serializer = new XMLSerializer();
		
	function loadXML(data){
		var doctype=data.indexOf("<!DOCTYPE"),
		str=data;
		if (doctype>-1) {
			var endDoctype=-1;
			for (var i=doctype;i<data.length;i++) {
				if (data.charAt(i)==">") {
					endDoctype=i;
					break;
				}
			}
			str=data.substring(0,doctype)+data.substring(endDoctype+1);
		}
		var xml=domParser.parseFromString(str, "text/xml");
		return xml;
	}
		
	return {domParser:domParser,
		document:document,
		serializer:serializer,
		loadXML:loadXML}
	}
);