$(document).ready(function() {
	if(!signedIn) {
		location.href = '/signin';
	} else {
		currentUser.then(user => {
			renderProfile(user);
		});
	}

	//account tab persist
	let currentAccountTab = sessionStorage.getItem('accountTab');
	if(currentAccountTab && performance.navigation.type > 0) {
		setTimeout(() => {
			$(`[data-tab="${currentAccountTab}"]`).trigger('click');
		}, 1);
	}

	$(document)
		//active tab indication
		.on('click', '[data-tab]', function() {
			sessionStorage.setItem('accountTab', `${$(this).attr('data-tab')}`);
			$('.tab-indicator').removeClass('active');
			$(this).find('.tab-indicator').addClass('active');
			$('[data-tabpane]').hide();
			$(`[data-tabpane="${$(this).attr('data-tab')}"]`).show();
			window.scrollTo({top: 0, behavior: 'smooth'});
		})
		//dropdown menu handling
		.on('click', '.menu-dropdown', function() {
			$(this).closest('.menu-dropdown').find('.menu-dropdown-list').show();
		})
		.on('click', function(e) {
			if(!$(e.target).hasClass('menu-dropdown')) {
				$('.menu-dropdown-list').hide();
			}
		})
		//modal handling
		.on('click', '[data-modalopen]', function() {
			const modalInfo = $(this).attr('data-modalopen');
			$('#modalTitle').text(modalInfo.replaceAll('-', ' '));
			$(`[data-modalform]`).hide();
			$(`[data-modalform="${modalInfo}"]`).attr('data-stripeitem', $(this).closest('[data-stripeitem]').attr('data-stripeitem')).show();
			$('.modal').fadeIn(250);
		})
		.on('click', '[data-modal="close"]', function() {
			$('.modal, [data-modalForm]').fadeOut(250);
			$(`[data-modalform]`).attr('data-stripeitem', '');
			$('#modalTitle').text('');
		})
		//update or cancel update of email & pass
		.on('click', '#updateProfileButton', function() {
			$(this).hide();
			$('#existingProfileInfo').hide();
			$('#updateProfile, #cancelUpdateProfile').show();
		})
		.on('click', '#cancelUpdateProfile', function() {
			$(this).hide();
			$('#updateProfile').hide();
			$('#updateProfileButton, #existingProfileInfo').show();
		})
		.on('click', '#updateProfileConfirm', function() {
			const user = {
				token: gumiAuth.token,
				email: gumiAuth.email,
				update: {
					email: $('#updateEmail').val(),
					first_name: $('#updateFirstName').val(),
					last_name: $('#updateLastName').val(),
					street_address: $('#updateStreetAddress').val(),
					city: $('#updateCity').val(),
					state: $('#updateState').val(),
					zip: $('#updateZip').val()
				}
			};
			updateUser(user).then(res => {
				if(res.error) {
					console.log(res.error);
				} else {
					if($('#updateEmail').val() !== $('[data-customer="email"]').text()) {
						signOut();
					} else {
						location.reload();
					}
				}
			});
		})

		//remove payment method
		.on('click', '#removePaymentMethodConfirm', function(e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitem]');
			const $id = $form.attr('data-stripeitem');
			const $pass = $('#removePaymentMethodPass').val();

			$form.find('.error-message').hide();
			signIn(gumiAuth.email, $pass)
				.then(res => {
					if(res.success) {
						removePaymentMethod($id)
							.then(res => {
								if(res.success) {
									$form.find('form').hide();
									$form.find('.success-message').show();
								} else {
									$('.button-loader').hide();
									$form.find('.text.error').text('Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com');
									$form.find('.error-message').show();
								}
							});
						;
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(res.error);
						$form.find('.error-message').show();
					}
				});
		})
		;
	;

	//functions
	async function renderProfile(user) {
		//render profile
		$('[data-customer="firstName"]').html(user.first_name);
		$('[data-customer="email"]').html(user.email);
		$('#shippingAddress').html(`${user.first_name} ${user.last_name}<br>
			${user.street_address}<br>
			${user.city}, ${user.state}, ${user.zip}`);

		//render profile update form
		$('#updateEmail').val(user.email);
		$('#updateFirstName').val(user.first_name);
		$('#updateLastName').val(user.last_name);
		$('#updateStreetAddress').val(user.street_address);
		$('#updateCity').val(user.city);
		$('#updateState').val(user.state);
		$('#updateZip').val(user.zip);

		//render payment methods
		await getPaymentMethods(gumiAuth.token)
			.then(methods => {
				if(methods.payment_method_count > 0) {
					for(const method of methods.payment_methods) {
						const cardIcons = {
							visa: "",
							amex: "",
							mastercard: "",
							jcb: "",
							discover: "",
							unionpay: ""
						};
						$('#paymentMethodsList').append(`
						<div class="w-layout-grid grid payment-method-card" data-stripeitem="${method.id}">
							<div class="w-layout-grid grid _2col">
								<div class="cell a-end">
									<img src="https://uploads-ssl.webflow.com/6012e1ca5effcb5c10935dc4/6054e16af351c7a1b1d8ff29_chip.svg" loading="lazy" width="40" alt="chip" class="chip-image">
								</div>
								<div class="cell a-start j-end">
									<div class="font-awesome brands _40 white">${cardIcons[method.card.brand]}</div>
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
							<div href="#" class="edit-card-bubble menu-dropdown">
								<div class="font-awesome _12 menu-dropdown"></div>
								<div class="menu-dropdown-list">
									<!-- <a href="#" class="dropdown-menu-item" data-modalopen="Update-payment-method"><span class="font-awesome _12"> &nbsp</span>Update billing info</a>
									<div class="divider no-margin"></div> -->
									<a href="#" class="dropdown-menu-item" data-modalopen="Remove-payment-method"><span class="font-awesome"> &nbsp</span>Remove payment method</a>
								</div>
							</div>
						</div>
					`);
					};
				} else {
					$('.empty-payment-methods').css('display', 'grid').show();
				}
			});
		;
	}
});