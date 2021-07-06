$(document).ready(function() {
	getReviews()
		.then(res => {
			renderReviews(res);
		});
	;
	$(document)
		.on('click', '#searchButton', function() {
			//change search icon
			if($(this).text() === '') {
				$(this).text('');
			} else {
				$(this).text('');
			}
		})
		.on('click', '#contact', function() {
			$('div.zsiq_floatmain.zsiq_theme1.siq_bR').click();
		})
		;
	;

	//filter handling
	let filterActive = false;
	$('[filter="button"]').click(function() {
		const category = $(this).find($('input')).val();

		if(filterActive && $(this).attr('class').indexOf('filter-active') >= 0) {
			$('.filter-active').removeClass('filter-active');
			filterActive = false;
			$('[filter="item"]').fadeIn();
		} else if(filterActive && $(this).attr('class').indexOf('filter-active') < 0) {
			$('.filter-active').removeClass('filter-active');
			$(this).addClass('filter-active');
			filterActive = true;
			filter(category);
		} else {
			$(this).addClass('filter-active');
			filterActive = true;
			filter(category);
		}
	});
	function filter(category) {
		const items = $('[filter="item"]');

		items.each(function() {
			const item = $(this);
			const categories = [];

			$(item).find($('[filter="item-category"]')).each(function() {
				categories.push($(this).val());
			});

			if(categories.indexOf(category) >= 0) {
				$(item).fadeIn();
			} else {
				$(item).fadeOut();
			}
		});
	}
});