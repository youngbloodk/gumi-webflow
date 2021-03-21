//global variables
const signedIn = !$.cookie('gumiAuth') == false;

// global functions
function renderBoxCount() {
	const boxData = JSON.parse(localStorage.getItem('buildBox'));
	let boxTotals = [];
	boxData.forEach(element => boxTotals.push(element.quantity));
	let boxCount = boxTotals.reduce((a, b) => a + b, 0);
	$('#boxCount').text(boxCount);
	return boxCount;
};
async function request(url, body) {
	return await fetch(url, {
		method: "POST",
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
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/sign-in";
	const body = {
		email: email,
		password: pass
	};
	return await request(url, body)
		.then(async res => {
			//set cookie with email and token
			const date = new Date();
			const minutes = 30;
			date.setTime(date.getTime() + (minutes * 60 * 1000));
			$.cookie.json = true;
			const cookieData = { email: email, token: res.token };
			$.cookie('gumiAuth', cookieData, { expires: date });
			return res;
		});
}

function signOut() {
	$.removeCookie('gumiAuth');
	location.reload();
}

async function getCustomer(email, token) {
	const url = "https://gumi-api-dcln6.ondigitalocean.app/v1/user/get-user";
	const body = {
		email: email,
		token: token
	};
	return await request(url, body)
		.then(res => {
			return res.success;
		});
}


async function changePass(token, currentPass, newPass) {
	$('#errorMessage').hide();

	return await fetch("https://gumi-api-dcln6.ondigitalocean.app/v1/user/change-password", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Accept": "application/json",
		},
		mode: 'cors',
		body: JSON.stringify({
			token: token,
			current_pass: currentPass,
			new_pass: newPass
		})
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

		//prevent body scroll when mobile menu is open
		.on('click', 'mobile-menu-icon', function () {
			if ($('.nav-menu').is(':visible')) {
				$('body').css('overflow', 'hidden');
			} else {
				$('body').css('overflow', 'auto');
			}
		})
		;
});