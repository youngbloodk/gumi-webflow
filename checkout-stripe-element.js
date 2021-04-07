$(document).ready(function() {
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
	const card = elements.create('card', {style});
	const $pay = $('#payButton');
	const storage = JSON.parse(localStorage.getItem('gumiCheckout'));

	card.mount('#card-element');

	card.on('change', ({error}) => {
		let displayError = document.getElementById('card-errors');
		if(error) {
			displayError.textContent = error.message;
		} else {
			displayError.textContent = '';
		};
	});

	$pay.on('click', function(ev) {
		ev.preventDefault();

		if($('[name="paymentMethod"]:checked').val()) {

			getPaymentMethod($('[name="paymentMethod"]:checked').val()).then(p_m => {
				api_pay('payment_method', p_m);
			});
		} else {
			stripe.createToken(card, {
				name: `${storage.firstName} ${storage.lastName}`,
				address_line1: storage.address.street,
				address_city: storage.address.city,
				address_state: storage.address.state,
				address_zip: storage.address.zip,
				address_country: "US"
			}).then(result => {
				if(result.error) {
					$('.button-loader').hide();
					console.log(result.error);
					alert(result.error.message);
				} else {
					api_pay('card', result.token.id);
				}
			});
		}

	});
	//type is either 'payment_method' or 'card' and data is the payment method object or token 
	function api_pay(type, data) {

		const body = {
			email: storage.email,
			password: "test",
			first_name: storage.firstName,
			last_name: storage.lastName,
			street_address: storage.address.street,
			city: storage.address.city,
			state: storage.address.state,
			zip: storage.address.zip,
			items: JSON.parse(localStorage.buildBox),
			coupon: $('#discountCode').val(),
			meta: JSON.parse(localStorage.buildBoxMeta)
		};
		//add payment method to body
		if(type == 'card') {
			body.card = {
				token: data
			};
		} else if(type == 'payment_method') {
			body.payment_method = data;
		}

		apiPay(body)
			.then(function(res) {
				if(res.error) {
					alert(res.error);
					$('.button-loader').hide();
				} else {
					$pay.html('Paid!');
					localStorage.removeItem('buildBox');
					localStorage.removeItem('buildBoxMeta');
					sessionStorage.removeItem('discountcode');
					location.href = `/receipt?id=${res.success.invoice_id}$paid=true`;
				}
			});
	}
});