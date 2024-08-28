define(function(){
	var downSet={},upSet={};
	function down(e) {
		for (var i in downSet) {
			downSet[i](e);
		}
	}
	function up(e) {
		for (var i in upSet) {
			upSet[i](e);
		}
	}
	return {down:down,up:up,downSet:downSet,upSet:upSet};
});
