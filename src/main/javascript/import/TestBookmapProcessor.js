var requirejs = require('requirejs'),
fs = require('fs'),
repoDir="c:\\sw\\webeditor\\repo",
bookmapProcessor=requirejs("./bookmapProcessor");
dom=requirejs("./domStuff.js");


function readxml(str) {
}

function readkeyFile(key) {
	fs.readFile(repoDir+"\\"+key.substring(0,3)+"\\"+key.substring(3), function (err,data) {	
		if (err || !data) {
			return;
		}
		var metadata=JSON.parse(data),
		file=repoDir+"\\"+metadata.key.substring(0,3)+"\\"+metadata.key.substring(3);
		fs.readFile(file, function (err,data) {	
			if (err || !data) {
				return;
			}
			var rec={};
			rec.dom = new dom.DOMParser();
			rec.xml = rec.dom.parseFromString(""+data);
			bookmapProcessor.handleMap(rec,null);
		});
	})
}

// 767910f9c5037535cb79c32aa103e1dc241764af
// 35ef5a63c18499e93aa6409c20f5e40b
// /c/sw/webeditor/repo

readkeyFile("35ef5a63c18499e93aa6409c20f5e40b");
//readxmlfile('C:\\tmp\\eocmdrm\\content\\authoring\\fke1542993058170.ditamap');