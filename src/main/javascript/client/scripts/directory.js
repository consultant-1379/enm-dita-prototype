define(function(){
	var directory={},repomaps={};
	function getTarget(p) {
		return directory[p];
	}
	return {"repomaps":repomaps,"directory":directory,"getTarget":getTarget};
});