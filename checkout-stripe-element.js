$(document).ready(function () {
	const stripe = Stripe(
		'pk_live_51GxkpfCPdzv45ixkbLQvPRK8cFrSCBVwOHoGlyFNYFk4FdA2670GKbNxiOeAFEblAMyxUXNlXSDAQH4rRvEmWz6200zrSqyGXu'
	);
	const elements = stripe.elements();
	const style = {
		base: {
			fontFamily: 'Proxima Soft',
			fontSize: '16px',
			color: 'grey',
		},
	};
	const card = elements.create('card', { style });
	const $pay = $('#payButton');

	card.mount('#card-element');

	card.on('change', ({ error }) => {
		let displayError = document.getElementById('card-errors');
		if (error) {
			displayError.textContent = error.message;
		} else {
			displayError.textContent = '';
		}
	});

	$pay.on('click', function (ev) {
		const storage = JSON.parse(localStorage.getItem('gumiCheckout'));
		ev.preventDefault();
		if (
			!$('#checkoutEmail').val() ||
			!$('#checkoutFirstName').val() ||
			!$('#checkoutLastName').val() ||
			!$('#checkoutStreetAddress').val() ||
			!$('#checkoutCity').val() ||
			!$('#checkoutState').val() ||
			!$('#checkoutZip').val()
		) {
			$('.button-loader').hide();
			alert('Please fill out all fields before checking out :)');
		} else {
			if ($('[name="paymentMethod"]:checked').val()) {
				getPaymentMethod($('[name="paymentMethod"]:checked').val()).then(
					(payment_method) => {
						api_pay(payment_method);
					}
				);
			} else {
				stripe
					.createPaymentMethod({
						type: 'card',
						card: card,
						billing_details: {
							name: `${storage.firstName} ${storage.lastName}`,
							address: {
								line1: storage.address.street,
								city: storage.address.city,
								state: storage.address.state,
								country: 'US',
								postal_code: storage.address.zip,
							},
						},
					})
					.then((res) => {
						if (res.error) {
							$('.button-loader').hide();
							alert(res.error.message);
						} else {
							api_pay(res.paymentMethod);
						}
					});
			}
		}
	});

	function api_pay(payment_method) {
		const storage = JSON.parse(localStorage.getItem('gumiCheckout'));
		const body = {
			email: storage.email,
			first_name: storage.firstName,
			last_name: storage.lastName,
			street_address: storage.address.street,
			city: storage.address.city,
			state: storage.address.state,
			zip: storage.address.zip,
			items: JSON.parse(localStorage.buildBox),
			coupon: $('#discountCode').val().toLowerCase(),
			meta: JSON.parse(localStorage.buildBoxMeta),
			payment_method: payment_method,
		};

		apiPay(body).then(function (res) {
			if (res.error) {
				alert(res.error);
				$('.button-loader').hide();
			} else if (res.success) {
				let invoice_id = res.success.invoice_id;
				$pay.html('Paid!');
				trackCheckout(body.email, 'purchase', invoice_id);
				rewardful('convert', { email: storage.email });
				localStorage.removeItem('buildBox');
				localStorage.removeItem('buildBoxMeta');
				localStorage.removeItem('gumiCheckout');
				sessionStorage.removeItem('discountcode');
				location.href = `/receipt?id=${invoice_id}&paid=true`;
			} else {
				alert(
					'There was an error processing your payment. Please use a different card'
				);
				$('.button-loader').hide();
			}
		});
	}
});
