define(function(){
	function getParameter(n) {
		var name = n.replace(/[\[]/, '\\[');
		name=name.replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};
	var map=getParameter("map");
	var test=getParameter("test");
	var topic=getParameter("topic");
	return {map:map,topic:topic,test:test};
});