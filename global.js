//global variables
let signedIn = !$.cookie('gumiAuth') == false;
let gumiAuth;
let currentUser;


if (signedIn) {
	// verifyToken(JSON.parse($.cookie('gumiAuth')).token).then(res => {
	// 	if (res.valid == true) {
	gumiAuth = JSON.parse($.cookie('gumiAuth'));
	currentUser = getUser(gumiAuth.email, gumiAuth.token);
	// }
	// });
}

// global functions
function renderBoxCount() {
	const boxData = JSON.parse(localStorage.getItem('buildBox'));
	if (boxData) {
		let boxTotals = [];
		boxData.forEach(element => boxTotals.push(element.quantity));
		let boxCount = boxTotals.reduce((a, b) => a + b, 0);
		$('#boxCount').text(boxCount);
		return boxCount;
	}
}

async function request(method, url, body) {
	return await fetch(url, {
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Accept": "application/json",
		},
		mode: 'cors',
		body: JSON.stringify(body)
	})
		.then(response => response.json())
		.then(async res => {
			return await res;
		});
}

async function signIn(email, pass) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/sign-in";
	const body = {
		email: email,
		password: pass
	};
	return await request(method, url, body)
		.then(async res => {
			if (res.success) {
				//set cookie with email and token
				const date = new Date();
				const minutes = 30;
				date.setTime(date.getTime() + (minutes * 60 * 1000));
				$.cookie.json = true;
				const cookieData = { email: email, token: res.token };
				$.cookie('gumiAuth', cookieData, { expires: date });
			}
			return res;
		});
}

function signOut() {
	$.removeCookie('gumiAuth');
	location.reload();
}

async function verifyToken(token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user//verify-token";
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(async res => {
			return res;
		});
	;
}

async function emailExists(email) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/email-exists";
	const body = {
		email: email
	};
	return await request(method, url, body)
		.then(async res => {
			return res;
		});
}

async function getUser(email, token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/get-user";
	const body = {
		email: email,
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

//token required in body
async function updateUser(data) {
	const method = "PUT";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/";
	return await request(method, url, data)
		.then(res => {
			return res.success;
		});
}

async function changePass(token, currentPass, newPass) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/change-password";
	const body = {
		token: token,
		current_pass: currentPass,
		new_pass: newPass
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});

}

async function getSubscriptions(token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/subscriptions";
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function pauseSubscription(id, date) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/subscriptions/pause";
	const body = {
		id: id,
		custom_date: date
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function resumeSubscription(id) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/subscriptions/resume";
	const body = {
		id: id,
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function getProduct(id) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/product";
	const body = {
		id: id
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getPaymentMethods(token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/payment-methods";
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getPaymentMethods(token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/payment-methods";
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getInvoice(id) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/invoice";
	const body = {
		id: id
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function getInvoices(token) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/invoices";
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function couponExists(coupon) {
	const method = "POST";
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/coupon-exists";
	const body = {
		value: coupon.toLowerCase()
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

function evenRound(num, decimalPlaces) {
	const d = decimalPlaces || 0;
	const m = Math.pow(10, d);
	const n = +(d ? num * m : num).toFixed(8);
	const i = Math.floor(n), f = n - i;
	const e = 1e-8;
	const r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 == 0) ? i : i + 1) : Math.round(n); return d ? r / m : r;
}

function getURLParam(key) {
	return new URLSearchParams(window.location.search).get(key);
}

function addCheckoutItem(item, quantity = 1) {
	let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
	let freq_info = '';
	let removeButton = '';
	if (is_sub) {
		let freq_name = $('.select option:selected').text();
		freq_info = `${freq_name}`;
	} else {
		freq_info = `Just this once`;
	} if (location.href.indexOf('box') > 0) {
		removeButton = `<div style="color: red; cursor: pointer;" class="text remove-button">Remove</div>`;
	}
	$('#boxItemsList').append(`
		<div data-sku="${item.sku}">
			<div class="w-layout-grid grid _3col auto-auto-1fr column-gap-10">
				<img src="${item.image}" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
				<div class="w-layout-grid grid _1col row-gap-0">
					<div class="text semibold">${item.name}</div>
					<div class="text">Quantity: <span data-id="quantity">${quantity}</span></div>
					<div class="text">Delivered: ${freq_info}</div>
					${removeButton}
				</div>
				<div class="text right" data-item="price">$${(Number((item.price).replace(/[^0-9.-]+/g, '')) * quantity).toFixed(2)}</div>
			</div>
			<div class="divider"></div>
		</div>
	`);
}

function renderMetaFromStorage() {
	let storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
	let sub_val = $('input[type="radio"][name="subscription"]:checked').val() == "true";
	if (sub_val != storage.is_sub) {
		evaluateSub(storage);
	}
	$('.select').val(storage.freq).trigger('change');
}

function evaluateSub(storage = null) {
	if (storage === null) {
		storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
	}
	if (storage.is_sub) {
		$('#true').click().attr('checked', true);
		$('#true').closest('div').find('.text').addClass('light');
		$('#false').closest('div').find('.text').removeClass('light');
		$('#deliveryFrequencyWrap').show();
	} else {
		$('#false').click().attr('checked', true);
		$('#false').closest('div').find('.text').addClass('light');
		$('#true').closest('div').find('.text').removeClass('light');
		$('#deliveryFrequencyWrap').hide();
	}
}

function updateCheckoutRender() {
	const $emptyMessage = $('.empty-box');
	const $continueBlock = $('#continueToCheckout');

	// Update subtotal
	let is_sub = $('input[type="radio"][name="subscription"]:checked').val() == "true";
	let storage = JSON.parse(localStorage.getItem('buildBox'));
	let subtotal = 0.00;
	let shipping = 0.00;
	let totalQuant = renderBoxCount();

	for (const item of storage) {
		const item_data = getItemDataFromSku(item.sku);
		subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
	}
	if (totalQuant == 1) {
		shipping = 5.00;
	} else if (totalQuant >= 2 && totalQuant <= 6) {
		shipping = 8.50;
	} else if (totalQuant > 6) {
		shipping = 12.00;
	}

	if (is_sub) {
		$('#shippingTitleText').text('Free Shipping 🎉');
		$('#shippingAmount').text(`$0.00`);
	} else {
		$('#shippingTitleText').text('Shipping');
		$('#shippingAmount').text(`$${shipping.toFixed(2)}`);
	}

	$('#oneTimeSubtotal').text(`$${(subtotal + shipping).toFixed(2)}`);
	$('#subSubtotal').text(`$${subtotal.toFixed(2)}`);
	$('#subtotalAcutal, #checkoutSubtotal').text(`$${subtotal.toFixed(2)}`);


	if (storage.length > 0) {
		$emptyMessage.hide();
		$continueBlock.show();
		$('#emptyWrap').addClass('middle');

	} else {
		$emptyMessage.show();
		$continueBlock.hide();
		$('#emptyWrap').removeClass('middle');

	}
}

function getItemDataFromSku(sku) {
	const $list_item = $(`.build-your-box-item .product-data
		input[name="sku"][value="${sku}"]`).closest('.build-your-box-item');
	return getItemDataFromBuildBoxItem($list_item);
}

function getItemDataFromBuildBoxItem($el) {
	const $product_data = $el.find('.product-data input');
	let data = {
		freq: parseInt($('#sub_frequency').val()) > 0 ? $('.product-select').val() : null
	};
	$product_data.each(function () {
		const name = $(this).attr('name');
		const value = $(this).attr('value');
		data[name] = value;
	});
	return data;
}

//global on ready
$(document).ready(async function () {

	renderBoxCount();

	if (signedIn) {
		$('[data-id="signIn"]').hide();
		$('[data-id="myAccount"]').show();
		$('[data-id="signOut"]').show();
	} else {
		$('[data-id="signIn"]').show();
		$('[data-id="myAccount"]').hide();
		$('[data-id="signOut"]').hide();
	}

	$(document)

		.on('click', '[data-id="signOut"]', function () {
			signOut();
		})

		//button loaders global
		.on('click', '.button', function () {
			$(this).closest('.button-wrap').find('.button-loader').show();
			setTimeout(function () {
				$('.button-loader').hide();
			}, 3000);
		})

		.on('click', '[data-button="reload"]', function () {
			location.reload();
		})

		//prevent body scroll when mobile menu is open
		.on('click', 'mobile-menu-icon', function () {
			if ($('.nav-menu').is(':visible')) {
				$('body').css('overflow', 'hidden');
			} else {
				$('body').css('overflow', 'auto');
			}
		})
		;
	;
});