//signedIn is a global variable defined on the webflow site

$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderBuildBoxFromStorage();
	renderCheckoutFromStorage();
	renderBoxTotals('full');
	updateCheckoutForm('render');


	$(document)
		.on('change', 'form :input', function () {
			updateCheckoutForm('save');
			renderBoxTotals();
		})

		.on('change', '#checkoutEmail', function () {

			fetch("https://gumi-api-dcln6.ondigitalocean.app/v1/user/email-exists", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Accept": "application/json",
				},
				mode: 'cors',
				body: JSON.stringify({
					email: $(this).val()
				})
			}).then(response => response.json())
				.then(function (res) {
					console.log(res);
					if (res.exists == true && !signedIn) {
						$('#passwordWrap').show();
						$('#checkoutPassword').prop('required', true);
					} else if (res.exists == true && signedIn) {
						$('#passwordWrap').hide();
						$('#welcomeMessageWrap').show();
					} else {
						$('#passwordWrap').hide();
						$('#checkoutPassword').prop('required', false);
					}
				}).catch(error => console.log('error', error));
		})

		.on('click', '#signIn', function () {
			let $email = $('#checkoutEmail').val();
			let $pass = $('#checkoutPassword').val();
			signIn($email, $pass)
				.then(async res => {
					getCustomer($email, res.token)
						.then(res => {
							$('#passwordWrap').hide();
							$('#welcomeMessageWrap').show();
							$('#checkoutFirstName').val(res.success.first_name);
							$('#checkoutLastName').val(res.success.last_name);
							$('#checkoutStreetAddress').val(res.success.street_address);
							$('#checkoutCity').val(res.success.city);
							$('#checkoutState').val(res.success.state);
							$('#checkout-zip').val(res.success.zip);
							updateCheckoutForm('save');
						});
				});

		})


		.on('input', '#checkout-zip', function () {
			$(this).val($(this).val().replace(/[^0-9\.]/g, ''));
		})

		.on('click', '#payButton', function () {
			$('.button-loader').show();
			setTimeout(
				function () {
					$('.button-loader').hide();
				}, 2000);

		})

		.on('click', '#discountApply', function discountApply() {
			const $error = $('#discountError');
			const $discountAmountText = $('#checkoutDiscount');
			const $discountLineItem = $('#discountLineItem');
			const $discountAppliedWrap = $('#discountAppliedWrap');
			const $discountName = $('#discountName');
			const $discountInput = $('#discountCode').val();

			$error.hide();
			$discountLineItem.hide();
			$discountAppliedWrap.hide();

			if ($discountInput !== '') {
				fetch('https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/coupon-exists', {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Accept": "application/json",
					},
					mode: 'cors',
					body: JSON.stringify({
						value: $discountInput
					})
				}).then(response => response.json())
					.then(function (data) {
						console.log(data);
						if (data.error) {
							if (data.error.startsWith('No such coupon:')) {
								$error.show().text(`Sorry! ${$discountInput} is not a valid coupon...`);
								setTimeout(() => {
									$error.hide();
								}, 5000);
							} else {
								$error.show().text(data.error);
								setTimeout(() => {
									$error.hide();
								}, 5000);
							}
						} else {
							if (data.amount_off !== null) {
								$discountAmountText.text(`-$${(data.amount_off / 100).toFixed(2)}`);
							} else {
								$discountAmountText.text(`-$${evenRound((data.percent_off / 100) * Number($('#checkout-subtotal').text().replace(/[^0-9.-]+/g, "")), 2)}`);
							}
							localStorage.setItem('discountcode', `${$discountInput}`);
							$discountAppliedWrap.show();
							$discountLineItem.show();
							$discountName.text(data.name);
							$('#discountFieldRow').hide();
							renderBoxTotals();
						}
					});
			} else {
				$error.show().text('The discount field is empty, silly!');
				setTimeout(() => {
					$error.hide();
				}, 5000);
			}
		})

		.on('click', '#removeDiscount', function () {
			localStorage.setItem('discountcode', '');
			$('#discountCode').val('');
			$('#discountFieldRow').show();
			$('#checkoutDiscount').text('$0.00');
			renderBoxTotals('full');
		});
	;

	function addCheckoutItem(item, quantity = 1) {
		let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
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
		$('#payment-form .cart-list').append(`
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
			<input type="number" class="field ticker" min="0" max="6" placeholder="0" name="itemQuantity"
				value="${quantity}" readonly />
		</div>
	</div>
</li>
`);
	}

	function evaluateSub(storage = null) {
		if (storage === null) {
			storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		}
		if (storage.is_sub) {
			$('#true').click().attr('checked', true);
			$('#true').closest('div').find('.text').addClass('light');
			$('#false').closest('div').find('.text').removeClass('light');
			$('.price.compare').removeClass('active');
			$('.price.black').show();
			$('#deliveryFrequencyWrap').show();
		} else {
			$('#false').click().attr('checked', true);
			$('#false').closest('div').find('.text').addClass('light');
			$('#true').closest('div').find('.text').removeClass('light');
			$('.price.compare').addClass('active');
			$('.price.black').hide();
			$('#deliveryFrequencyWrap').hide();
		}
	}

	function renderMetaFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
		let sub_val = $('input[type="radio"][name="subscription"]:checked').val() == "true";
		if (sub_val != storage.is_sub) {
			evaluateSub(storage);
		}
		$('.select').val(storage.freq).trigger('change');
	}

	function renderBuildBoxFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		for (const item of storage) {
			updateBuildBoxQuantity(item.sku, item.quantity);
		}
	}

	function renderCheckoutFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCartRender();
	}

	function updateCartRender() {
		const $emptyMessage = $('.empty-box');

		// Update subtotal
		let storage = JSON.parse(localStorage.getItem('buildBox'));
		let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
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

	function updateBuildBoxQuantity(sku, quantity) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		$list_item.find('.ticker input').val(quantity);
	}

	function getItemDataFromSku(sku) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
	}

	function getItemDataFromBuildBoxItem($el) {
		const $product_data = $el.find('.product-data input');
		let data = {
			freq: $('#sub_frequency').val() > 0 ? $('.product-select').val() : null
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
	function init() {
		let cart_meta = localStorage.getItem('buildBoxMeta');
		if (cart_meta == null) {
			localStorage.setItem('buildBoxMeta', JSON.stringify({
				is_sub: true,
				freq: '1'
			}));
		}
		let cart = localStorage.getItem('buildBox');
		if (cart == null || cart == "[]") {
			localStorage.setItem('buildBox', "[]");
		}
	}

	function renderBoxTotals(type) {
		evaluateSub();

		//shipping calc & render
		const $shippingText = $('#checkout-shipping');
		const $shippingMethodPriceText = $('#shippingMethodPrice');
		const $shippingMethodText = $('#shippingMethodText');
		const $boxCount = parseInt($('#boxCount').text());
		let shipping = 0;

		if ($boxCount == 1) {
			$shippingText.text('$5.00');
			$shippingMethodPriceText.text('$5.00');
			shipping = 5;
		} else if ($boxCount == 2) {
			$shippingText.text('$8.50');
			$shippingMethodPriceText.text('$8.50');
			shipping = 8.5;
		} else if ($boxCount > 2) {
			$shippingText.text('$0.00');
			$shippingMethodText.text('Free Shipping');
			$shippingMethodPriceText.text('$0.00');
			shipping = 0;
		}

		//discount code render
		const code = localStorage.getItem('discountcode');

		if (code == null || code == '') {
			$('#discountLineItem').hide();
			$('#discountAppliedWrap').hide();
		} else if (code !== null && type == 'full') {
			$('#discountCode').val(code);
			setTimeout(() => {
				$('#discountApply').click();
			}, 100);

		}

		//tax, subtotal, total, subscription renewal price calculation
		const $customerState = $('#checkoutState').val();
		const $subtotal = Number($('#checkout-subtotal').text().replace(/[^0-9.-]+/g, ""));
		const $discount = Number($('#checkoutDiscount').text().replace(/[^0-9.-]+/g, ""));
		let taxRate = 0;

		if ($customerState === 'UT') {
			taxRate = .03;
		}

		const $taxText = $('#checkout-tax');
		const $totalText = $('#checkout-total');
		const $subscriptionRenewalPriceText = $('[data-id="subscriptionPriceText"]');
		const subtotalAfterDiscount = $subtotal + $discount;
		const tax = evenRound((subtotalAfterDiscount * taxRate), 2);
		const total = subtotalAfterDiscount + tax + shipping;
		const subscriptionRenewalPrice = $subtotal + tax + shipping;

		//tax, subtotal, total, subscription renewal price render
		$totalText.text(`$${total.toFixed(2)}`);
		$taxText.text(`$${tax.toFixed(2)}`);
		$subscriptionRenewalPriceText.text(`$${subscriptionRenewalPrice.toFixed(2)}`);
		$('#payButton').text(`Pay $${total.toFixed(2)}`);

		// renewal date render
		const is_sub = JSON.parse(localStorage.getItem('buildBoxMeta')).is_sub;
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const $renewalDateText = $('#checkoutRenewalDate');
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

	function updateCheckoutForm(method) {
		const $email = $('#checkoutEmail');
		const $firstName = $('#checkoutFirstName');
		const $lastName = $('#checkoutLastName');
		const $street = $('#checkoutStreetAddress');
		const $city = $('#checkoutCity');
		const $state = $('#checkoutState');
		const $zip = $('#checkout-zip');
		const checkoutDataStorage = localStorage.getItem('gumiCheckout');
		let checkoutData = `{
			"email" : "${$email.val()}",
			"firstName" : "${$firstName.val()}",
			"lastName" : "${$lastName.val()}",
			"address" : {
				"street" : "${$street.val()}",
				"city" : "${$city.val()}",
				"state" : "${$state.val()}",
				"zip" : "${$zip.val()}" } }`;
		if (method == 'save') {
			localStorage.setItem('gumiCheckout', checkoutData);
		} else if (method == 'render' && checkoutDataStorage != null) {
			checkoutData = JSON.parse(checkoutDataStorage);
			$email.val(checkoutData.email);
			$firstName.val(checkoutData.firstName);
			$lastName.val(checkoutData.lastName);
			$street.val(checkoutData.address.street);
			$city.val(checkoutData.address.city);
			$state.val(checkoutData.address.state);
			$zip.val(checkoutData.address.zip);
		}

		if ($email.val() !== '' && method == 'render') {
			setTimeout(function () {
				$email.trigger('change');
			}, 10);
		}

		renderBoxTotals();
	}


});