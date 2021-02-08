$(document).ready(function () {
	$(document)
		.on('change', 'input[type="radio"]', function () {
			const $pic = $('#productImage');
			const $selectedQuant = Number($('input[type=radio]:checked').val());
			const $totalPrice = $('#mainSubPrice');
			const $currentRegPrice = $('#currentRegPrice');
			const $currentSubPrice = $('#currentSubPrice');
			const regPrices = ['{{wf {&quot;path&quot;:&quot;pricing-structure:1-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:2-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:3-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:4-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:5-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:6-bottle-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}'];
			const subPrices = ['{{wf {&quot;path&quot;:&quot;pricing-structure:1-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:2-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:3-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:4-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:5-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}', '{{wf {&quot;path&quot;:&quot;pricing-structure:6-bottle-subscription-price&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}'];
			const pics = ['{{wf {&quot;path&quot;:&quot;main-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;2-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;3-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;4-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;5-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}', '{{wf {&quot;path&quot;:&quot;6-bottle-image&quot;,&quot;type&quot;:&quot;ImageRef&quot;\} }}'];

			$pic.css("background-image", `url(${pics[$selectedQuant - 1]})`);
			$currentRegPrice.text(`${subPrices[$selectedQuant - 1]}`);
			$currentSubPrice.text(`${regPrices[$selectedQuant - 1]}`);
		})

		.on('change', '#subFrequency', function () {
			const $deliveryFrequency = Number($('#subFrequency').val());
			const $deliveryFrequencyText = $('#deliveryFrequencyText');

			if ($deliveryFrequency === 0) {
				$deliveryFrequencyText.hide();
			} else if ($deliveryFrequency == 1) {
				$deliveryFrequencyText.text(`Every month`);
			} else {
				$deliveryFrequencyText.text(`Every ${$deliveryFrequency} months`);
			}
		})

		.on('submit', '#product-form', function (e) {
			e.preventDefault();
			e.stopPropagation();
			const sku = $('#productcode').val();
			const freq = $('#subFrequency').val();
			const is_sub = freq > 0;
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
						$('.button-loader').hide();
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

fbq('track', 'ViewContent', {content_name: "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"});