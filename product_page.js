$(document).ready(function () {
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
			window.location.pathname = "/box";
		});
});

// fbq('track', 'ViewContent', {
	// content_name: "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"
// });