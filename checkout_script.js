$(document).ready(function () {
	init();
	renderMetaFromStorage();
	renderCheckoutFromStorage();
	renderCheckoutTotals('full');
	updateCheckoutForm('render');
	updateCheckoutRender();

	$(document)
		.on('change', 'form :input', function () {
			updateCheckoutForm('save');
			renderCheckoutTotals();
		})

		.on('change', '#checkoutEmail', function () {
			$('#welcomeMessageWrap').hide();
			emailExists($(this).val())
				.then(async res => {
					if (res.exists == true && !signedIn) {
						$('#passwordWrap').show();
						$('#checkoutPassword').prop('required', true);
					} else if (res.exists == true && signedIn && gumiAuth.email == $('#checkoutEmail').val()) {
						$('#passwordWrap').hide();
						$('#welcomeMessageWrap').show();
					} else if (res.exists == true && signedIn && gumiAuth.email !== $('#checkoutEmail').val()) {
						$('#passwordWrap').show();
						$('#welcomeMessageWrap').hide();
					} else {
						$('#passwordWrap').hide();
						$('#checkoutPassword').prop('required', false);
						$('#welcomeMessageWrap').hide();
					}
				})
				;
		})

		.on('click', '#signIn', async function () {
			const $errorMessage = $('#errorMessage');
			$errorMessage.hide();

			let $email = $('#checkoutEmail').val();
			let $pass = $('#checkoutPassword').val();
			await signIn($email, $pass)
				.then(res => {
					if (res.error) {
						$errorMessage.text(res.error).show();
					} else {
						location.reload();
					}

				});

		})

		.on('input', '#checkoutZip', function () {
			$(this).val($(this).val().replace(/[^0-9\.]/g, ''));
		})

		.on('click', '#payButton', function () {
			$('.button-loader').show();
			setTimeout(
				function () {
					$('.button-loader').hide();
				}, 20000);

		})

		.on('click', '#discountApply', function () {
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
				couponExists($discountInput)
					.then(data => {
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
								$discountAmountText.text(`-$${(evenRound((data.percent_off / 100) * Number($('#checkoutSubtotal').text().replace(/[^0-9.-]+/g, "")), 2)).toFixed(2)}`);
							}
							sessionStorage.setItem('discountcode', `${$discountInput}`);
							$discountAppliedWrap.show();
							$discountLineItem.show();
							$discountName.text(data.name);
							$('#discountFieldRow').hide();
							renderCheckoutTotals();
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
			renderCheckoutTotals('full');
		});
	;

	function renderCheckoutFromStorage() {
		let storage = JSON.parse(localStorage.getItem('buildBox'));

		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			addCheckoutItem(item_data, item.quantity);
		}
		updateCheckoutRender();
	}

	function getItemDataFromSku(sku) {
		const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
		return getItemDataFromBuildBoxItem($list_item);
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
		if (signedIn) {
			currentUser.then(res => {
				$('#passwordWrap').hide();
				$('#welcomeMessageWrap').show();
				$('#checkoutFirstName, [data-id="customerFirstName"]').html(res.first_name);
				$('#checkoutLastName').val(res.last_name);
				$('#checkoutStreetAddress').val(res.street_address);
				$('#checkoutCity').val(res.city);
				$('#checkoutState').val(res.state);
				$('#checkoutZip').val(res.zip);
				updateCheckoutForm('save');
			});
		}
	}

	function renderCheckoutTotals(type) {
		evaluateSub();
		const storage = JSON.parse(localStorage.getItem('buildBox'));
		const is_sub = JSON.parse(localStorage.getItem('buildBoxMeta')).is_sub;
		//shipping calc & render
		const $shippingText = $('#checkoutShipping');
		const $shippingMethodPriceText = $('#shippingMethodPrice');
		const $shippingMethodText = $('#shippingMethodText');
		const $boxCount = renderBoxCount();
		let shipping = 0.00;

		if (!is_sub) {
			if ($boxCount == 1) {
				$shippingText.text('$5.00');
				$shippingMethodPriceText.text('$5.00');
				shipping = 5.00;
			} else if ($boxCount >= 2 && $boxCount < 6) {
				$shippingText.text('$8.50');
				$shippingMethodPriceText.text('$8.50');
				shipping = 8.50;
			} else if ($boxCount > 6) {
				$shippingText.text('$12.00');
				$shippingMethodPriceText.text('$12.00');
				shipping = 12.00;
			}
		} else {
			$shippingMethodText.text('Free Shipping');
			$shippingText.text('$0.00');
			$shippingMethodPriceText.text('$0.00');
		}

		//discount code render
		const code = sessionStorage.getItem('discountcode');

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
		const $subtotal = Number($('#checkoutSubtotal').text().replace(/[^0-9.-]+/g, ""));
		const $discount = Number($('#checkoutDiscount').text().replace(/[^0-9.-]+/g, ""));
		const discountPercent = evenRound($discount / $subtotal, 2);
		let taxRate = 0;
		let tax = 0;
		let subscriptionTax = 0;
		const $taxText = $('#checkoutTax');
		const $totalText = $('#checkoutTotal');
		const $subscriptionRenewalPriceText = $('[data-id="subscriptionPriceText"]');
		const subtotalAfterDiscount = $subtotal + $discount;
		const total = subtotalAfterDiscount + shipping + tax;
		const subscriptionRenewalPrice = $subtotal + subscriptionTax + shipping;

		//tax, subtotal, total, subscription renewal price render
		if ($customerState === 'UT') {
			taxRate = .03;
		}
		for (const item of storage) {
			const item_data = getItemDataFromSku(item.sku);
			let itemTax = evenRound(((parseFloat(item_data.price) * parseFloat(item.quantity)) * (1 + discountPercent)) * taxRate, 2);
			tax += itemTax;
		}
		tax += evenRound(shipping * taxRate, 2);
		$taxText.text(`$${tax.toFixed(2)}`);
		$subscriptionRenewalPriceText.text(`$${subscriptionRenewalPrice.toFixed(2)}`);
		$totalText.text(`$${total.toFixed(2)}`);
		$('#payButton').text(`Pay $${total.toFixed(2)}`);

		// renewal date render
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const $renewalDateText = $('#checkoutRenewalDate');
		const frequency = parseInt(JSON.parse(localStorage.getItem('buildBoxMeta')).freq);
		const today = new Date();
		let renewalDate = new Date(today);
		renewalDate = new Date(renewalDate.setMonth(renewalDate.getMonth() + frequency));
		let renewalMonth = new Date(today.getFullYear(), today.getMonth() + frequency).getMonth();
		let lastDayOfRenewalMonth = new Date(renewalDate.getFullYear(), renewalMonth + 1, 0);
		if (is_sub) {
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
		const $zip = $('#checkoutZip');
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

		renderCheckoutTotals();
	}
});