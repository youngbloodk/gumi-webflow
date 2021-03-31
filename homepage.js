$(document).ready(function () {
	getReviews()
		.then(res => {
			renderReveiws(res);
		});
	;
	$(document)
		.on('click', '#searchButton', function () {
			//change search icon
			if ($(this).text() === '') {
				$(this).text('');
			} else {
				$(this).text('');
			}
		})
		.on('click', '#contact', function () {
			$('div.zsiq_floatmain.zsiq_theme1.siq_bR').click();
		})
		;
	;
});