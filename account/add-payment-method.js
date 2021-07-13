$(document).ready(function() {
	const stripe = Stripe('pk_live_51GxkpfCPdzv45ixkbLQvPRK8cFrSCBVwOHoGlyFNYFk4FdA2670GKbNxiOeAFEblAMyxUXNlXSDAQH4rRvEmWz6200zrSqyGXu');
	const elements = stripe.elements();
	const style = {
		base: {
			fontFamily: 'Proxima Soft',
			fontSize: '16px',
			color: 'grey',
		},
	};
	const card = elements.create('card', {style});
	const $addPaymentMethod = $('#addPaymentMethodConfirm');


	card.mount('#card-element');

	card.on('change', ({error}) => {
		let displayError = document.getElementById('card-errors');
		if(error) {
			displayError.textContent = error.message;
		} else {
			displayError.textContent = '';
		};
	});

	$addPaymentMethod.on('click', async function(ev) {
		const $form = $(this).closest('[data-modalform');
		let user = await currentUser;
		ev.preventDefault();

		$form.find('.error-message').hide();
		stripe.createPaymentMethod({
			type: 'card',
			card: card,
			billing_details: {
				name: `${user.first_name} ${user.last_name}`
			}
		}).then(res => {
			if(res.error) {
				$('.button-loader').hide();
				alert(res.error.message);
			} else {
				addPaymentMethod({
					payment_method: res.paymentMethod.id,
					customer: user.stripe_customer_id
				}).then(res => {
					if(res.success) {
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text('Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com');
						$form.find('.error-message').show();
					}
				});
			}
		});
	});
});