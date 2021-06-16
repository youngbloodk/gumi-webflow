$(document).ready(function() {
	const params = {
		sku: getURLParam('product_sku'),
		name: getURLParam('name'),
		email: getURLParam('email')
	};
	if(params.sku) {
		$('#postReviewSku').val(params.sku);
	}
	if(params.name) {
		$('#postReviewFirstName').val(params.name.split(' ')[0]);
		$('#postReviewLastName').val(params.name.split(' ')[1]);
	}
	if(params.email) {
		$('#postReviewEmail').val(params.email);
	}

	$(document)
		.on('click', '#closeModal', function() {
			$('.modal').fadeOut(250);
		})
		.on('mouseover', '.radio-button-field.star.w-radio', function() {
			if(!$("input[name='postReviewRating']:checked").val()) {
				renderLeaveReviewStars($(this));
			}
		})
		.on('click', '.radio-button-field.star.w-radio', function() {
			renderLeaveReviewStars($(this));
		})
		.on('mouseout', '#starsRatingWrap', function() {
			if(!$("input[name='postReviewRating']:checked").val()) {
				$(this).find('.hide').hide();
			}
		})
		.on('click', '#submitReview', function(e) {
			e.preventDefault();
			let $email = $('#postReviewEmail').val();
			let $first_name = $('#postReviewFirstName').val();
			let $last_name = $('#postReviewLastName').val();
			let $review_title = $('#postReviewTitle').val();
			let $review = $('#postReviewText').val();
			let $rating = $('[name="postReviewRating"]:checked').val();
			let $product_sku = $('#postReviewSku').val();

			if(!$email || !$first_name || !$last_name || !$review_title || !$review || !$rating) {
				alert("Please complete all fields before submitting your review :)");
				$('.button-loader').hide();
			} else {
				const reviewData = {
					email: $email,
					first_name: $first_name,
					last_name: $last_name,
					review_title: $review_title,
					review: $review,
					rating: $rating,
					product_sku: $product_sku,
					review_date: moment()._d
				};
				postReview(reviewData)
					.then(res => {
						let $form = $('#postReviewFormWrap');
						if(res.success) {
							$form.find('form').hide();
							$form.find('.success-message').show();
						} else {
							$('.button-loader').hide();
							$form.find('.text.error').text('Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com');
							$form.find('.error-message').show();
						}
					});
				;
			}
		})
		;
	;
	function renderLeaveReviewStars(target) {
		let stars = $('.radio-button-field.star.w-radio');
		let starNumber = parseInt(target.find('input').val());
		for(const star of stars) {
			if($(star).find('input').val() <= starNumber) {
				$(star).find('.hide').show();
			} else {
				$(star).find('.hide').hide();
			}
		}
	}
});