$(document).ready(function () {

	if (!signedIn) {
		window.location.href = '/signin';
	} else {
		renderAccount();
	}

	$(document)
		//active tab indication
		.on('click', '[data-tab]', function () {
			$('.tab-indicator').removeClass('active');
			$(this).find('.tab-indicator').addClass('active');
			$('[data-tabpane]').hide();
			$(`[data-tabpane="${$(this).attr('data-tab')}"]`).show();
		})
		//update or cancel update of email & pass
		.on('click', '#updateProfileButton', function () {
			$(this).hide();
			$('#updateProfile, #cancelUpdateProfile').show();
		})
		.on('click', '#cancelUpdateProfile', function () {
			$($(this) + '#updateprofile').hide();
			$('#updateProfileButton').show();
		})
		//subscription menu dropdown
		.on('click', '#subscriptionMenuDropdownButton', function () {
			$(this).closest('.subscription-menu-dropdown').find('.subscription-menu-dropdown-list').show();
		})
		//click off for all elements
		.on('click', function (e) {
			if (!$(e.target).hasClass('subscription-menu-dropdown-button')) {
				$('.subscription-menu-dropdown-list').hide();
			}
		})
		//edit or cancel edit payment methods
		.on('click', '#editPaymentMethods', function () {
			$(this).hide();
			$('.remove-card-bubble').show();
			$('.payment-method-card').addClass('card-jiggle');
			$('#cancelEditPaymentMethods').show();
			$('.add-payment-method').hide();
		})
		.on('click', '#cancelEditPaymentMethods', function () {
			$(this).hide();
			$('.remove-card-bubble').hide();
			$('.payment-method-card').removeClass('card-jiggle');
			$('#editPaymentMethods').show();
			$('.add-payment-method').show();
		})
		;

	async function renderAccount() {
		$('[data-customer="firstName"]').html(currentUser.first_name);
		$('[data-customer="email"]').html(currentUser.email);
		$('#shippingAddress').html(`${currentUser.first_name} ${currentUser.last_name}<br>
			${currentUser.street_address}<br>
			${currentUser.city}, ${currentUser.state}, ${currentUser.zip}`);

		await getPaymentMethods(gumiAuth.token)
			.then(methods => {
				for (const method of methods.payment_methods) {
					$('#paymentMethodsList').prepend(
						`<div class="w-layout-grid grid payment-method-card" data-id="${method.id}">
    <div class="w-layout-grid grid _2col">
        <div class="cell a-end">
            <img src="https://uploads-ssl.webflow.com/6012e1ca5effcb5c10935dc4/6054e16af351c7a1b1d8ff29_chip.svg"
                loading="lazy" width="40" alt="" class="chip-image">
        </div>
        <div class="cell a-start j-end">
            <div class="font-awesome brands _40 white"></div>
        </div>
    </div>
    <div class="w-layout-grid grid _2col _1fr-auto center column-gap-0">
        <div class="card-number-dots">••••••••••</div>
        <div class="text center light">${method.card.last4}</div>
    </div>
    <div class="w-layout-grid grid _2col _1fr-auto">
        <div class="text light">${method.billing_details.name}</div>
        <div class="text right light">${method.card.exp_month}/${method.card.exp_year}</div>
    </div>
    <a href="#" class="remove-card-bubble"><span class="font-awesome center"></span> </a>
</div>`
					);
				};
			});
	}
});