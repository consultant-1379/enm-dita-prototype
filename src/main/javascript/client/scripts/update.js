define(["ajax","directory"], function(ajax, directory) {
	var directory;
	if (!directory) directory={};	
	return {directory:directory};
});