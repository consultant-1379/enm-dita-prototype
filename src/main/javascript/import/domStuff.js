var requirejs = require('requirejs');
define(function(){
	var XMLdom = new require('xmldom'),
		DOMParser = XMLdom.DOMParser,
		domParser = new DOMParser(),
		document = domParser.parseFromString("<map></map>", "text/xml"),
		XMLSerializer = new XMLdom.XMLSerializer();
	return {XMLdom:XMLdom,
		DOMParser:DOMParser,
		domParser:domParser,
		document:document,
		XMLSerializer:XMLSerializer}
	}
);
