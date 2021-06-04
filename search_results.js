$(document).ready(function() {
	const search_term = getURLParam('query');
	//google search tracking
	gtag('event', 'search', {
		search_term: search_term
	});

	//klaviyo search event
	var _learnq = _learnq || [];
	_learnq.push(['track', 'item_search', {
		search_term: search_term
	}]);
});