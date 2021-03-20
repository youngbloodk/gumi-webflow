$(document).ready(function () {
	let currentUser;

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
		.on('click', '#updateProfile', function () {
			$('[data-id="updateProfileItem"]').show();
			$('[data-id="existingProfileItem"]').hide();
		})
		.on('click', '#cancelUpdateProfile', function () {
			$('[data-id="updateProfileItem"]').hide();
			$('[data-id="existingProfileItem"]').show();
		})
		//update or cancel update of shipping address
		.on('click', '#updateShippingAddress', function () {
			$('[data-id="updateAddressItem"]').show();
			$('[data-id="existingAddressItem"]').hide();
		})
		.on('click', '#cancelUpdateAddress', function () {
			$('[data-id="updateAddressItem"]').hide();
			$('[data-id="existingAddressItem"]').show();
		})
		//subscription menu dropdown
		.on('click', '#subscriptionMenuDropdownButton', function () {
			$(this).closest('.subscription-menu-dropdown').find('.subscription-menu-dropdown-list').show();
		})
		.on('click', function (e) {
			if (!$(e.target).hasClass('subscription-menu-dropdown-button')) {
				$('.subscription-menu-dropdown-list').hide();
			}
		})

		;

	async function renderAccount() {
		currentUser = await getCustomer(JSON.parse($.cookie('gumiAuth')).email, JSON.parse($.cookie('gumiAuth')).token);
		$('[data-customer="firstName"]').html(currentUser.first_name);
		$('[data-customer="email"]').html(currentUser.email);
		$('#shippingAddress').html(`${currentUser.first_name} ${currentUser.last_name}<br>
			${currentUser.street_address}<br>
			${currentUser.city}, ${currentUser.state}, ${currentUser.zip}`);

	}
});