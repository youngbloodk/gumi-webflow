$(document).ready(function () {
	const stripe = Stripe('pk_test_51GxkpfCPdzv45ixk8Za5c697vUb1FNkvXbyCm2gnLwK5UEbty0SWdkXgIMAmOGLwrtEsopIJgZSDtvdI5kLHeiW700mAsnbgiy');
	const elements = stripe.elements();
	const style = {
		base: {
			fontFamily: 'Proxima Soft',
			fontSize: '16px',
			color: 'grey',
		},
	};
	// Create an instance of the card Element.
	const card = elements.create('card', { style });
	const $pay = $('#payButton');
	const storage = JSON.parse(localStorage.getItem('gumiCheckout'));

	card.mount('#card-element');

	card.on('change', ({ error }) => {
		let displayError = document.getElementById('card-errors');
		if (error) {
			displayError.textContent = error.message;
		} else {
			displayError.textContent = '';
		};

		$pay.on('click', function (ev) {
			ev.preventDefault();
			const $newPaymentMethod = $('#newPaymentMethod');
			if ($newPaymentMethod.is(':checked')) {
				stripe.createToken(card, {
					name: `${storage.firstName} ${storage.lastName}`,
					address_line1: storage.address.street,
					address_city: storage.address.city,
					address_state: storage.address.state,
					address_zip: storage.address.zip,
					address_country: "US"
				}).then(result => {
					if (result.error) {
						console.log(result.error);
						alert(result.error.message);
					} else {
						api_pay(result);
					}
				});
			} else {
				api_pay('', $newPaymentMethod.val());
			}
		});
	});

	function api_pay(card_token, payment_method) {
		fetch('https://gumi-api-dcln6.ondigitalocean.app/v1/stripe/pay', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Accept": "application/json",
			},
			mode: 'cors',
			body: JSON.stringify({
				email: storage.email,
				password: "test",
				first_name: storage.firstName,
				last_name: storage.lastName,
				street_address: storage.address.street,
				city: storage.address.city,
				state: storage.address.state,
				zip: storage.address.zip,
				card: {
					token: card_token.token.id,
					payment_method: payment_method
				},
				items: JSON.parse(localStorage.buildBox),
				coupon: $('#discountCode').val(),
				meta: JSON.parse(localStorage.buildBoxMeta)
			})
		}).then(response => response.json())
			.then(function (res) {
				if (res.error) {
					alert(res.error);
					$pay.html(prev_pay_html);
				} else {
					$pay.html('Paid!');
					localStorage.removeItem('buildBox');
					localStorage.removeItem('buildBoxMeta');
					localStorage.removeItem('discountcode');
					location.href = `/receipt?id=${res.success.invoice_id}`;
				}
			}).catch(function (res) {
				$pay.html(prev_pay_html);
			});
	}
});