$(document).ready(function () {
	getReviews($('#productcode').val())
		.then(res => {
			renderReveiws(res);
		});
	;

	$('form').trigger('change');
	$(document)
		.on('change', 'form', function () {
			const is_sub = $('#true').is(':checked');
			const $pic = $('#productImage');
			const $quant = parseInt($('#quantity option:selected').val());
			const $oneTimeSubtotal = $('#oneTimeSubtotal');
			const $subSubtotal = $('#subSubtotal');
			const $subtotalText = $('#subtotalActual');
			const prices = ['{{wf {&quot;path&quot;:&quot;pricing-structure:1-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:2-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:3-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:4-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:5-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:6-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}'];
			const pics = ['{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;2-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;3-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;4-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;5-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;6-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}'];
			const subtotal = parseInt(prices[$quant - 1]);

			let shipping = 0.00;

			if ($quant == 1) {
				shipping = 5.00;
			} else if ($quant >= 2 && $quant <= 6) {
				shipping = 8.50;
			} else if ($quant > 6) {
				shipping = 12.00;
			}

			if (is_sub) {
				$('#shippingTitleText').html('Free shipping 🎉');
				$('#shippingAmount').html(`$0.00`);
			} else {
				$('#shippingTitleText').html('Shipping');
				$('#shippingAmount').html(`$${shipping.toFixed(2)}`);
			}

			$subtotalText.html(`$${subtotal.toFixed(2)}`);
			$oneTimeSubtotal.html(`$${(subtotal + shipping).toFixed(2)}`);
			$subSubtotal.html(`$${subtotal.toFixed(2)} + Free shipping 🎉`);
			$pic.css("background-image", `url(${pics[$quant - 1]})`);

			const $deliveryFrequency = Number($('#subFrequency').val());
			const $deliveryFrequencyText = $('#deliveryFrequencyText');
			const $subPriceWrap = $('.sub-price-wrap');

			if ($deliveryFrequency === 0) {
				$deliveryFrequencyText.hide();
				$subPriceWrap.hide();
			} else {
				if ($deliveryFrequency == 1) {
					$deliveryFrequencyText.text(`Every month`);
				} else {
					$deliveryFrequencyText.text(`Every ${$deliveryFrequency} months`);
				}
				$deliveryFrequencyText.show();
				$subPriceWrap.show();
			}
			if ($('#true').is(':checked')) {
				$('#deliveryFrequencyWrap').show();
				$('#deliveryFrequencyWrap').prop('disabled', false);

			} else {
				$('#deliveryFrequencyWrap').hide();
				$('#deliveryFrequencyWrap').prop('disabled', 'disabled');
			}
		})

		.on('submit', '#product-form', function (e) {
			e.preventDefault();
			e.stopPropagation();
			const sku = $('#productcode').val();
			const freq = $('#subFrequency').val();
			const is_sub = $('#true').is(':checked');
			const quantity = parseInt($('#quantity').val());

			// Set sub info
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: is_sub,
				freq: freq
			}));
			// Add product
			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			let quantity_added = false;
			for (const item of storage) {
				if (item.sku == sku) {
					item.quantity = parseInt(item.quantity);
					if (item.quantity + quantity > 6) {
						window.alert(`You cannot add more than 6 of a single item and you currently have: ${item.quantity}`);
						return;
					}
					item.quantity += quantity;
					quantity_added = true;
					break;
				}
			}
			if (!quantity_added) {
				storage.push({
					sku: sku,
					quantity: quantity
				});
			}
			localStorage.setItem('buildBox', JSON.stringify(storage));
			location.pathname = "/box";
		})
		;
	;
	function renderReveiws(reviewData) {
		const reviews = reviewData.success;

		//calc & render review count
		const count = reviews.length;
		$('[data-reviews="count"]').text(count);

		//calc rating totals
		let ratings = {};
		let ratingTotal = 0.00;
		for (const review of reviews) {
			if (!ratings[review.rating[0]]) {
				ratings[review.rating[0]] = 0;
			}
			ratings[review.rating[0]]++;
			ratingTotal += parseFloat(review.rating);
		}
		const rating = Math.round((ratingTotal / reviews.length) * 4) / 4;
		let finalRating;
		if (rating.toString().indexOf('.') > 0) {
			finalRating = rating.toFixed(2);
		} else {
			finalRating = rating.toFixed(1);
		}
		$('[data-reviews="rating"]').text(finalRating);
		$('.stars-fill').css('width', `${rating / 5 * 100}%`);

		//render rating meters
		const meters = $('[data-reviewmeter]');
		for (const meter of meters) {
			const ratingNumber = ratings[$(meter).attr('data-reviewmeter')];
			let percent = 0;
			if (ratingNumber) {
				percent = ratingNumber / count;
			}
			$(meter).find('.rating-meter-fill').css('width', `${percent * 100}%`);
		}

		//render reviews
		for (const review of reviews) {
			const rating = parseInt(review.rating);
			const percent = rating / 5;
			const date = moment(review.review_date).format('MMM Do, YYYY');
			let title = review.review_title;
			if (!title) {
				title = `${rating} stars`;
			}
			$('#reviewsList').append(`
				<div class="w-layout-grid grid _1col row-gap-10">
					<div class="w-layout-grid grid _2col _1fr-auto">
						<div class="cell">
							<div class="cell relative">
								<div class="font-awesome stars-fill yellow" style="width: ${percent}%;"></div>
								<div class="font-awesome-reg stars yellow"></div>
							</div>
						</div>
						<div id="w-node-_252682f1-4915-c3a6-34d0-354212e5a59c-0f76a0b3" class="text right">${date}</div>
					</div>
					<div class="h5 semibold">${title}</div>
					<div class="text">"${review.review}"</div>
					<div class="text secondary bold">${review.first_name} ${review.last_name[0].toUpperCase()}. - Verified Buyer <span class="font-awesome blue"></span></div>
				</div>
			`);
		}
	}
});