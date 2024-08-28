define(["ajax"],function(ajax){
	function run() {
		generateHtml()
	}
	function generateHtml() {
		var p=document.getElementById("docslot");
		var str=p.outerHTML;
		var resp={};
		resp.filename="acrolinx\\test.xml";
		resp.encoding="utf8";
		resp.data=str;
		ajax.ajaxPost("/post",JSON.stringify(resp),function(){alert("saved")});		
	}
	return {run:run};
});