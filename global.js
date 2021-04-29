//global variables
let signedIn = !$.cookie('gumiAuth') == false;
let gumiAuth;
let currentUser;
const apiUrl = 'https://gumi-api-dcln6.ondigitalocean.app/v1';


if(signedIn) {
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
	if(boxData) {
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
	const url = `${apiUrl}/user/sign-in`;
	const body = {
		email: email,
		password: pass
	};
	return await request(method, url, body)
		.then(async res => {
			if(res.success) {
				//set cookie with email and token
				const date = new Date();
				const minutes = 1440;
				date.setTime(date.getTime() + (minutes * 60 * 1000));
				$.cookie.json = true;
				const cookieData = {email: email, token: res.token};
				$.cookie('gumiAuth', cookieData, {expires: date});
			}
			return res;
		});
}

function signOut() {
	$.removeCookie('gumiAuth');
	location.reload();
}

//reason MUST be either 'forgot_password' or 'activate_account'
async function resetPass(email, reason) {
	const method = "POST";
	const url = `${apiUrl}/user/reset-password`;
	const body = {
		email: email,
		reason: reason
	};
	return await request(method, url, body)
		.then(async res => {
			return res;
		});
	;
}

async function uuidPassChange(uuid, pass) {
	const method = "POST";
	const url = `${apiUrl}/user/uuid-password-change`;
	const body = {
		uuid: uuid,
		password: pass
	};
	return await request(method, url, body)
		.then(async res => {
			return res;
		});
	;
}

async function verifyToken(token) {
	const method = "POST";
	const url = `${apiUrl}/user/verify-token`;
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
	const url = `${apiUrl}/user/email-exists`;
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
	const url = `${apiUrl}/user/get-user`;
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
	const url = `${apiUrl}/user/`;
	return await request(method, url, data)
		.then(res => {
			return res.success;
		});
}

async function changePass(token, currentPass, newPass) {
	const method = "POST";
	const url = `${apiUrl}/user/change-password`;
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

async function apiPay(body) {
	const method = "POST";
	const url = `${apiUrl}/stripe/pay`;

	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function getSubscriptions(token) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions`;
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getSubitemOptions(sub_id) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions/item/options`;
	const body = {
		sub_id: sub_id,
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function updateSubItemQuantity(item_id, quantity) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions/item/quantity`;
	const body = {
		item_id: item_id,
		quantity: quantity
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function deleteSubItem(item_id) {
	const method = "DELETE";
	const url = `${apiUrl}/stripe/subscriptions/item/${item_id}`;

	return await request(method, url)
		.then(res => {
			return res;
		});
}

async function updateSubFreq(sub_id, freq) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions/change-freq`;
	const body = {
		sub_id: sub_id,
		freq: freq
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function pauseSubscription(id, date) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions/pause`;
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
	const url = `${apiUrl}/stripe/subscriptions/resume`;
	const body = {
		id: id,
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function cancelSubscription(id) {
	const method = "POST";
	const url = `${apiUrl}/stripe/subscriptions/cancel`;
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
	const url = `${apiUrl}/stripe/product`;
	const body = {
		id: id
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getReviews(sku = '') {
	const method = "GET";
	const url = `${apiUrl}/reviews/${sku}`;

	return await request(method, url)
		.then(res => {
			return res;
		});
}

async function postReview(reviewData) {
	const method = "POST";
	const url = `${apiUrl}/reviews`;
	const body = reviewData;

	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function getPaymentMethods(token) {
	const method = "POST";
	const url = `${apiUrl}/stripe/payment-methods`;
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res.success;
		});
}

async function getPaymentMethod(id) {
	const method = "GET";
	const url = `${apiUrl}/stripe/payment-methods/${id}`;

	return await request(method, url)
		.then(res => {
			return res.success;
		});
}

async function removePaymentMethod(id) {
	const method = "POST";
	const url = `${apiUrl}/stripe/payment-methods/detach`;
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
	const url = `${apiUrl}/stripe/invoices`;
	const body = {
		token: token
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function getInvoice(id) {
	const method = "POST";
	const url = `${apiUrl}/stripe/invoice`;
	const body = {
		id: id
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}

async function couponExists(coupon) {
	const method = "POST";
	const url = `${apiUrl}/stripe/coupon-exists`;
	const body = {
		value: coupon.toLowerCase()
	};
	return await request(method, url, body)
		.then(res => {
			return res;
		});
}
function formatReviewData(reviewData) {
	const reviews = reviewData.success;

	//calc & render review count
	const count = reviews.length;
	$('[data-reviews="count"]').text(count);

	//calc rating totals
	let ratings = {};
	let ratingTotal = 0.00;
	for(const review of reviews) {
		if(!ratings[review.rating[0]]) {
			ratings[review.rating[0]] = 0;
		}
		ratings[review.rating[0]]++;
		ratingTotal += parseFloat(review.rating);
	}
	const rating = Math.round((ratingTotal / reviews.length) * 4) / 4;
	let finalRating;
	if(rating.toString().indexOf('.') > 0) {
		finalRating = rating.toFixed(2);
	} else {
		finalRating = rating.toFixed(1);
	}
	return {
		count: count,
		finalRating: finalRating,
		rating: rating,
		ratings: ratings,
		ratingTotal: ratingTotal,
		reviews: reviews
	};
}
function renderReviewStars(reviewData, target) {
	$(target).find($('[data-reviews="rating"]')).text(reviewData.finalRating);
	$(target).find($('.stars-fill')).css('width', `${reviewData.rating / 5 * 100}%`);
}
function renderReviews(reviewData) {
	const reviewMeta = formatReviewData(reviewData);

	//render rating meters
	const meters = $('[data-reviewmeter]');
	for(const meter of meters) {
		const ratingNumber = ratings[$(meter).attr('data-reviewmeter')];
		let percent = 0;
		if(ratingNumber) {
			percent = ratingNumber / count;
		}
		$(meter).find('.rating-meter-fill').css('width', `${percent * 100}%`);
	}

	//render reviews
	for(const review of reviews) {
		const rating = parseInt(review.rating);
		const percent = rating / 5;
		const date = moment(review.review_date).format('MMM D, YYYY');
		let title = review.review_title;
		if(!title) {
			title = `${rating} stars`;
		}
		let name = `${review.first_name} ${review.last_name[0].toUpperCase()}. - `;
		if(!review.first_name) {
			name = '';
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
						<div class="text secondary bold">${name}Verified Buyer <span class="font-awesome blue"></span></div>
					</div>
				`);
	}
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
	if(is_sub) {
		let freq_name = $('.select option:selected').text();
		freq_info = `${freq_name}`;
	} else {
		freq_info = `Just this once`;
	} if(location.href.indexOf('box') > 0) {
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
	if(sub_val != storage.is_sub) {
		evaluateSub(storage);
	}
	if(!$('#sub_frequency').val()) {
		$('#subFrequency').val('1m').trigger('change');
	}
	$('#subFrequency').val(storage.freq).trigger('change');
}

function evaluateSub(storage = null) {
	if(storage === null) {
		storage = JSON.parse(localStorage.getItem('buildBoxMeta'));
	}
	if(storage.is_sub) {
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

	for(const item of storage) {
		const item_data = getItemDataFromSku(item.sku);
		subtotal += parseFloat(item_data.price) * parseFloat(item.quantity);
	}
	if(totalQuant == 1) {
		shipping = 5.00;
	} else if(totalQuant >= 2 && totalQuant <= 6) {
		shipping = 8.50;
	} else if(totalQuant > 6) {
		shipping = 12.00;
	}

	if(is_sub) {
		$('#shippingTitleText').text('Free Shipping 🎉');
		$('#shippingAmount').text(`$0.00`);
	} else {
		$('#shippingTitleText').text('Shipping');
		$('#shippingAmount').text(`$${shipping.toFixed(2)}`);
	}

	$('#oneTimeSubtotal').text(`$${(subtotal + shipping).toFixed(2)}`);
	$('#subSubtotal').text(`$${subtotal.toFixed(2)}`);
	$('#subtotalAcutal, #checkoutSubtotal').text(`$${subtotal.toFixed(2)}`);


	if(storage.length > 0) {
		$emptyMessage.hide();
		$continueBlock.show();
	} else {
		$emptyMessage.show();
		$continueBlock.hide();
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
	$product_data.each(function() {
		const name = $(this).attr('name');
		const value = $(this).attr('value');
		data[name] = value;
	});
	return data;
}

//global on ready
$(document).ready(async function() {

	renderBoxCount();

	if(signedIn) {
		$('[data-id="signIn"]').hide();
		$('[data-id="myAccount"]').show();
		$('[data-id="signOut"]').show();
	} else {
		$('[data-id="signIn"]').show();
		$('[data-id="myAccount"]').hide();
		$('[data-id="signOut"]').hide();
	}

	$(document)

		.on('click', '[data-id="signOut"]', function() {
			signOut();
		})

		.on('click', '[data-chat="open"]', function() {
			$zopim.livechat.window.show();
		})

		//button loaders global
		.on('click', '.button', function() {
			$(this).closest('.button-wrap').find('.button-loader').show();
			setTimeout(function() {
				$('.button-loader').hide();
			}, 30000);
		})

		.on('click', '[data-button="reload"]', function() {
			location.reload();
		})

		//prevent body scroll when mobile menu is open
		.on('click', 'mobile-menu-icon', function() {
			if($('.nav-menu').is(':visible')) {
				$('body').css('overflow', 'hidden');
			} else {
				$('body').css('overflow', 'auto');
			}
		})
		;
	;
});