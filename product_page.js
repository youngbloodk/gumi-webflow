$(document).ready(function() {

	trackProduct('view_item', 1);
	getReviews($('#productcode').val())
		.then(res => {
			renderReviewStars(res, $('[data-review="main"]'));
			renderReviews(res);
		});
	;

	$('form').trigger('change');
	$(document)
		.on('change', 'form', function() {
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

			if($quant == 1) {
				shipping = 5.00;
			} else if($quant >= 2 && $quant <= 6) {
				shipping = 8.50;
			} else if($quant > 6) {
				shipping = 12.00;
			}

			if(is_sub) {
				$('#shippingTitleText').html('Free shipping 🎉');
				$('#shippingAmount').html(`$0.00`);
			} else {
				$('#shippingTitleText').html('Shipping');
				$('#shippingAmount').html(`$${shipping.toFixed(2)}`);
			}

			$subtotalText.html(`$${subtotal.toFixed(2)}`);
			$oneTimeSubtotal.html(`$${subtotal.toFixed(2)} + $${shipping.toFixed(2)} shipping`);
			$subSubtotal.html(`$${subtotal.toFixed(2)} + Free shipping 🎉`);
			$pic.css("background-image", `url(${pics[$quant - 1]})`);

			const $deliveryFrequency = Number($('#subFrequency').val());
			const $deliveryFrequencyText = $('#deliveryFrequencyText');
			const $subPriceWrap = $('.sub-price-wrap');

			if($deliveryFrequency === 0) {
				$deliveryFrequencyText.hide();
				$subPriceWrap.hide();
			} else {
				if($deliveryFrequency == 1) {
					$deliveryFrequencyText.text(`Every month`);
				} else {
					$deliveryFrequencyText.text(`Every ${$deliveryFrequency} months`);
				}
				$deliveryFrequencyText.show();
				$subPriceWrap.show();
			}
			if($('#true').is(':checked')) {
				$('#deliveryFrequencyWrap').show();
				$('#deliveryFrequencyWrap').prop('disabled', false);

			} else {
				$('#deliveryFrequencyWrap').hide();
				$('#deliveryFrequencyWrap').prop('disabled', 'disabled');
			}
		})

		.on('submit', '#product-form', function(e) {
			e.preventDefault();
			e.stopPropagation();
			const sku = $('#productcode').val();
			const freq = $('#subFrequency').val();
			const is_sub = $('#true').is(':checked');
			const quantity = parseInt($('#quantity').val());

			trackProduct('add_to_cart', quantity);

			// Set sub info
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: is_sub,
				freq: freq
			}));
			// Add product
			let storage = JSON.parse(localStorage.getItem('buildBox') || "[]");
			let quantity_added = false;
			for(const item of storage) {
				if(item.sku == sku) {
					item.quantity = parseInt(item.quantity);
					if(item.quantity + quantity > 6) {
						window.alert(`You cannot add more than 6 of a single item and you currently have: ${item.quantity}`);
						return;
					}
					item.quantity += quantity;
					quantity_added = true;
					break;
				}
			}
			if(!quantity_added) {
				storage.push({
					sku: sku,
					quantity: quantity
				});
			}
			localStorage.setItem('buildBox', JSON.stringify(storage));
			location.pathname = "/box";
		})
		.on('click', '#write_review', function() {
			location.href = "/review?product_sku={{wf {&quot;path&quot;:&quot;sku&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}";
		});

	function trackProduct(event, quantity) {
		//klaviyo item
		const item = {
			"ProductName": "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
			"ProductID": "{{wf {&quot;path&quot;:&quot;sku&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
			"Categories": ["Gummies"],
			"ImageURL": "{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}",
			"URL": "https://www.guminutrition.com/goods/{{wf {&quot;path&quot;:&quot;slug&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
			"Brand": "Gumi",
			"Price": parseInt("{{wf {&quot;path&quot;:&quot;pricing-structure:1-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}")
		};

		//google item
		const googleItem = {
			id: item.ProductID,
			name: item.ProductName,
			price: item.Price
		};

		if(event == 'view_item') {
			_learnq.push(["track", "Viewed Product", item]);
			_learnq.push(["trackViewedItem", {
				"Title": item.ProductName,
				"ItemId": item.ProductID,
				"Categories": item.Categories,
				"ImageUrl": item.ImageURL,
				"Url": item.URL,
				"Metadata": {
					"Brand": item.Brand,
					"Price": item.Price,
				}
			}]);
		} else if(event == 'add_to_cart') {
			_learnq.push(["track", "Added to Cart", {
				"$value": item.Price * quantity,
				"AddedItemProductName": item.ProductName,
				"AddedItemProductID": item.ProductID,
				"AddedItemSKU": item.ProductID,
				"AddedItemImageURL": item.ImageURL,
				"AddedItemURL": item.URL,
				"AddedItemPrice": item.Price,
				"AddedItemQuantity": quantity,
			}]);
		}
		gtag('event', event, {
			value: googleItem.price * quantity,
			items: [googleItem]
		});
	}
});