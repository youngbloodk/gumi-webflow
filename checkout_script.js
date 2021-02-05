$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();
	renderBoxTotals();
	updateCheckoutForm('render');
	$(document)
		.on('input', 'form :input', function () {
			updateCheckoutForm('save');
			renderBoxTotals();
		})
		.on('click', '#payButton', function () {
			const $testName = $('#checkout-first-name').val();
			event.preventDefault();
			alert(`Thanks for testing, ${$testName}! Let Kohlmann know if you had any issues 😉`);
		})
		;
	function updateCheckoutItem (sku, method) {
		const $quantity = $(`.cart-item[data-sku="${sku}"]`).find('.ticker-quantity input');
		if ($quantity) {
			const quantity = parseInt($quantity.val());
			if ($quantity) {
				if (method == 'add') {
					$quantity[0].value = quantity + 1;
				}
				if (method == 'sub') {
					$quantity[0].value = quantity - 1;
					if ((quantity - 1) == 0) {
						removeCartItem(sku);
					}
				}
			}
		}
	}
	function addCheckoutItem (item, quantity = 1) {
		let is_sub = $('#subscribe').is(':checked');
		let price_info = `
<div class="cart-item-price">$${item.price}</div>
`;
		let freq_info = '';
		if (is_sub) {
			price_info = `
<div class="cart-item-price compare">$${item.price}</div>
<div class="cart-item-price">$${item.sub_price}0</div>
`;
			let freq_name = $('.select option:selected').text();
			freq_info = `<div class="cart-item-frequency">Delivered: ${freq_name}</div>`;
		} else {
			freq_info = `<div class="cart-item-frequency">Delivered: Just this once</div>`;
		}
		$('#build-your-box-form .cart-list').append(`
<li class="cart-item" data-sku="${item.sku}">
	<div class="cart-item-image-wrap">
		<img src="${item.image}" loading="lazy" sizes="(max-width: 479px) 13vw, 60px" alt="cart-item"
			class="cart-item-image">
	</div>
	<div class="product-info-wrap in-cart">
		<div class="cart-item-info-wrap">
			<div class="cart-item-name">${item.name}</div>
			<div class="cart-item-price-wrap">
				${price_info}
			</div>
			${freq_info}
		</div>
	</div>
	<div class="ticker-wrap">
		<div class="ticker-quantity">
			<input type="number" class="form-field ticker" min="0" max="6" placeholder="0" name="itemQuantity"
				value="${quantity}" readonly />
		</div>
	</div>
</li>
`);
	}
	function evaluateSub (storage = null) {
		if (storage === null) {
			storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		}
		if (storage.is_sub) {
			$('#delivered').show();
			$('.price.compare').removeClass('active');
			$('.price.black').show();
			$('#subscription-agreement-text').show();
		} else {
			$('#delivered').hide();
			$('.price.compare').addClass('active');
			$('.price.black').hide();
			$('#subscription-agreement-text').hide();
		}
	}
	function resetCheckoutCart () {
		$('#build-your-box-form .cart-list .cart-item').remove();
		renderCheckoutFromStorage();
	}
	function renderMetaFromStorage () {
		let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		let sub_btn = $('#subscribe').is(':checked');
		if (sub_btn != storage.is_sub) {
			$('#subscribe').click();
			evaluateSub(storage);
		}
		$('.select').val(storage.freq).trigger('change');
	}
	function renderBuildBoxFromStorage () {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		for (const item of storage) {
			updateBuildBoxQuantity(item.sku, item.quantity);
		}
	}
	function renderCheckoutFromStorage () {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCartRender();
	}
	function updateCartRender () {
		const $emptyMessage = $('.empty-box');

		// Update subtotal
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		let is_sub = $('#subscribe').is(':checked');
		let subtotal = 0.00;
		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			if (is_sub) {
				subtotal += parseFloat(item_data.sub_price) * parseFloat(item.quantity);
			} else {
				subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
			}
		}
		$('#checkout-subtotal').html('$' + subtotal.toFixed(2));
		if (storage.length > 0) {
			$emptyMessage.hide();
		} else {
			$emptyMessage.show();
		}
	}
	function removeCartItem (sku) {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		storage = storage.filter((item) => item.sku != sku);
		localStorage.setItem('buildBox', JSON.stringify(storage));
		$(`#build-your-box-form .cart-list .cart-item[data-sku="${sku}"]`).remove();
		updateBuildBoxQuantity(sku, 0);
	}
	function updateBuildBoxQuantity (sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data
input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);
	}
	function getItemDataFromSku (sku) {
		const $list_item = $(`.build-your-box-item .product-data
input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}
	function getItemData ($el) {
		const $list_item = $el.closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}
	function getItemDataFromBuildBoxItem ($el) {
		const $product_data = $el.find('.product-data input');
		let data = {
			freq: $('#subscribe').is(':checked') ? $('.product-select').val() : null
		};
		$product_data.each(function () {
			const name = $(this).attr('name');
			const value = $(this).attr('value');
			data[name] = value;
		});
		if (data.price) {
			data['sub_price'] = data.price - (data.price * 0.10);
		}
		return data;
	}
	// Initalize variables
	function init () {
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if (cart_meta == null) {
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1m'
			}));
		}

		let cart = localStorage.getItem('buildBox');
		if (cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
	}
	function renderBoxTotals () {
		//shipping render
		evaluateSub();
		const $shippingText = $('#checkout-shipping');
		const $shippingMethodPriceText = $('#shippingMethodPrice');
		const $shippingMethodText = $('#shippingMethodText');
		const $boxCount = parseInt($('#boxCount').text());
		let $shipping = 0;
		if ($boxCount == 1) {
			$shippingText.text('$5.00');
			$shippingMethodPriceText.text('$5.00');
			$shipping = 5;
		} else if ($boxCount == 2) {
			$shippingText.text('$8.50');
			$shippingMethodPriceText.text('$8.50');
			$shipping = 8.5;
		} else if ($boxCount > 2) {
			$shippingText.text('$0.00');
			$shippingMethodText.text('Free Shipping');
			$shippingMethodPriceText.text('$0.00');
			$shipping = 0;
		}
		//tax, subtotal and total render
		const $customerState = $('#checkout-state').val();
		const $subtotal = Number($('#checkout-subtotal').text().replace(/[^0-9.-]+/g, ""));
		const $discount = Number($('#checkout-discount').text().replace(/[^0-9.-]+/g, ""));
		const $taxText = $('#checkout-tax');
		const $totalText = $('#checkout-total');
		let $subtotalAfterDiscount = $subtotal - $discount;
		let $tax = 0;
		let $total = 0;
		if ($customerState === 'UT') {
			$tax = $subtotalAfterDiscount * .03;
			$tax = evenRound($tax, 2);
			$taxText.text(`$${$tax}`);
		} else if ($customerState === null) {
			$taxText.text(`TBD`);
		} else {
			$taxText.text(`$0.00`);
		}
		if ($customerState != null) {
			$total = $subtotalAfterDiscount + $tax + $shipping;
			$totalText.text(`$${$total.toFixed(2)}`);
			$('#payButton').text(`Pay $${$total.toFixed(2)}`);
		}
		// renewal date render
		const is_sub = JSON.parse(localStorage.getItem('buildBoxMeta')).is_sub;
		const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Augus', 'Sept', 'Oct', 'Nov', 'Dec'];
		const $renewalDateText = $('#checkout-renewal-date');
		const frequency = parseInt(JSON.parse(localStorage.getItem('buildBoxMeta')).freq);
		const today = new Date();
		let renewalDate = new Date(today);
		renewalDate = new Date(renewalDate.setMonth(renewalDate.getMonth() + frequency));
		let renewalMonth = new Date(today.getFullYear(), today.getMonth() + frequency).getMonth();
		let lastDayOfRenewalMonth = new Date(renewalDate.getFullYear(), renewalMonth + 1, 0);
		if (is_sub == true) {
			//if 31st is last day -> renew on last day of every month
			if (new Date(today.getTime() + 86400000).getDate() === 1 && today.getDate() === 31) {
				renewalDate = new Date(renewalDate.getFullYear(), renewalDate.getMonth(), 0);
			}
			//if last of renewal month is 28th or 29th renew on that end day respectively
			else if (lastDayOfRenewalMonth.getDate() == 28 || lastDayOfRenewalMonth.getDate() == 29) {
				renewalDate = new Date(renewalDate.getFullYear(), renewalMonth + 1, 0);
			}
			$renewalDateText.text(`${renewalDate.getDate()} ${months[renewalDate.getMonth()]} ${renewalDate.getFullYear()}`);
		}
	}

	function evenRound (num, decimalPlaces) {
		const d = decimalPlaces || 0;
		const m = Math.pow(10, d);
		const n = +(d ? num * m : num).toFixed(8);
		const i = Math.floor(n), f = n - i;
		const e = 1e-8;
		const r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 == 0) ? i : i + 1) : Math.round(n); return d ? r / m : r;
	} function
		updateCheckoutForm (method) {
		const $email = $('#checkout-email'); const $firstName = $('#checkout-first-name'); const
			$lastName = $('#checkout-last-name'); const $street = $('#checkout-street-address'); const $city = $('#checkout-city');
		const $state = $('#checkout-state'); const $zip = $('#checkout-zip'); const
			customerDataStorage = localStorage.getItem('gumiCheckout'); let customerData = `{ "email" : "${$email.val()}"
	, "firstName" : "${$firstName.val()}" , "lastName" : "${$lastName.val()}" , "address" : { "street"
	: "${$street.val()}" , "city" : "${$city.val()}" , "state" : "${$state.val()}" , "zip" : "${$city.val()}" } }`; if
			(method == 'save') {localStorage.setItem('gumiCheckout', customerData);} else if (method == 'render' &&
				customerDataStorage != null) {
			customerData = JSON.parse(customerDataStorage); $email.val(customerData.email);
			$firstName.val(customerData.firstName); $lastName.val(customerData.lastName);
			$street.val(customerData.address.street); $city.val(customerData.address.city);
			$state.val(customerData.address.state); $zip.val(customerData.address.zip);
		} renderBoxTotals();
	}
});