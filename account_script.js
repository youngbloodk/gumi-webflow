$(document).ready(function () {

	if (!signedIn) {
		window.location.href = '/signin';
	} else {
		currentUser.then(user => {
			renderAccount(user);
		});
	}

	$(document)
		//active tab indication
		.on('click', '[data-tab]', function () {
			$('.tab-indicator').removeClass('active');
			$(this).find('.tab-indicator').addClass('active');
			$('[data-tabpane]').hide();
			$(`[data-tabpane="${$(this).attr('data-tab')}"]`).show();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		})
		//update or cancel update of email & pass
		.on('click', '#updateProfileButton', function () {
			$(this).hide();
			$('#existingProfileInfo').hide();
			$('#updateProfile, #cancelUpdateProfile').show();
		})
		.on('click', '#cancelUpdateProfile', function () {
			$(this).hide();
			$('#updateProfile').hide();
			$('#updateProfileButton, #existingProfileInfo').show();
		})
		.on('click', '#updateProfileConfirm', function () {
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
				if (res.error) {
					console.log(res.error);
				} else {
					if ($('#updateEmail').val() !== $('[data-customer="email"]').text()) {
						signOut();
					} else {
						location.reload();
					}
				}
			});
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
		})
		.on('click', '#cancelEditPaymentMethods', function () {
			$(this).hide();
			$('.remove-card-bubble').hide();
			$('.payment-method-card').removeClass('card-jiggle');
			$('#editPaymentMethods').show();
		})
		;

	async function renderAccount(user) {
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
				for (const method of methods.payment_methods) {
					$('#paymentMethodsList').prepend(`
						<div class="w-layout-grid grid payment-method-card" data-id="${method.id}">
							<div class="w-layout-grid grid _2col">
								<div class="cell a-end">
									<img src="https://uploads-ssl.webflow.com/6012e1ca5effcb5c10935dc4/6054e16af351c7a1b1d8ff29_chip.svg" loading="lazy" width="40" alt="chip" class="chip-image">
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
							<a href="#" class="remove-card-bubble"><span class="font-awesome center"></span></a>
						</div>
					`);
				};
			});

		//render subscriptions
		await getSubscriptions(gumiAuth.token)
			.then(async subscriptions => {
				for (const subscription of subscriptions.subscriptions) {
					let subItems = [];
					let total = 0.00;
					let taxRate;
					let tax = 0;
					let taxInfo = '';
					let subscriptionTitle = subscription.items.total_count > 1 ? `${subscription.items.total_count} items` : `${subscription.items.total_count} item`;

					for (const subItem of subscription.items.data) {
						total += ((subItem.price.unit_amount * .01) * subItem.quantity);
						await getProduct(subItem.price.product)
							.then(product => {
								subItems.push(`
									<div class="w-layout-grid grid _3col auto-auto-1fr">
										<img src="${product.images[0]}" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
										<div class="w-layout-grid grid _1col row-gap-0">
											<div class="text semibold">${product.name}</div>
											<div class="text">Quantity: ${subItem.quantity}</div>
											<div class="text">Delivered: Every ${subItem.price.recurring.interval_count} ${subItem.price.recurring.interval}</div>
										</div>
										<div class="text right">$${((subItem.price.unit_amount * .01) * subItem.quantity).toFixed(2)}</div>
									</div>
									<div class="divider"></div>`);
							});
					};

					if (subscription.default_tax_rates[0]) {
						taxRate = subscription.default_tax_rates[0].percentage / 100;
						tax = total * taxRate;
						taxInfo = `<div class="w-layout-grid grid _2col _1fr-auto">
										<div class="text">Tax:</div>
										<div class="text right">$${tax}</div>
									</div>`;
					}

					let status = 'active';
					let renewalDate = subscription.current_period_end;
					let pauseUpdateRenewButtons = `<a href="#" class="subscription-menu-item"><span class="font-awesome _12 margin-right _5"></span> Update subscription</a>
											<div class="divider no-margin"></div>
											<a href="#" class="subscription-menu-item"><span class="font-awesome _12 margin-right _5"></span> Pause subscription</a>
											<div class="divider no-margin"></div>`;

					if (subscription.pause_collection) {
						status = 'paused';
						renewalDate = subscription.pause_collection.resumes_at;
						pauseUpdateRenewButtons = `<a href="#" class="subscription-menu-item"><span class="font-awesome _12 margin-right _5"></span> Restart subscription</a>
											<div class="divider no-margin"></div>
											<a href="#" class="subscription-menu-item"><span class="font-awesome _12 margin-right _5"></span> Change renewal date</a>
											<div class="divider no-margin"></div>`;
					}

					$('#subscriptionsList').append(`
						<div class="cell vertical card" data-subscription="${subscription.id}">
							<div class="cell-header">
								<div class="w-layout-grid grid _2col auto a-center">
									<div class="h5">${subscriptionTitle}</div>
									<div class="cell tag ${status}">
										<div id="discountName" class="text tag light">${status.charAt(0).toUpperCase()}${status.slice(1)}</div>
									</div>
								</div>
								<div class="subscription-menu-dropdown">
									<div id="subscriptionMenuDropdownButton" class="text subscription-menu-dropdown-button"><span
											class="font-awesome _12 subscription-menu-dropdown-button"></span> Edit</div>
									<div class="subscription-menu-dropdown-list">
										${pauseUpdateRenewButtons}
										<a href="#" class="subscription-menu-item"><span class="font-awesome _12 margin-right _5"></span>Cancel subscription</a>
									</div>
								</div>
							</div>
							<div class="cell-content footer">
								<div class="w-layout-grid grid _1col row-gap-10">
									<div data-subscription="items-list" class="w-layout-grid grid _1col row-gap-0">
										${await subItems.toString().replaceAll(',', '')}
									</div>
									<div class="w-layout-grid grid _1col row-gap-0">
										${taxInfo}
										<div class="w-layout-grid grid _2col _1fr-auto">
											<div class="text bold">Total:</div>
											<div class="text right bold">$${(total + tax).toFixed(2)}</div>
										</div>
									</div>
									<div class="w-layout-grid grid _2col _1fr-auto">
										<div class="text">Next shipment:</div>
										<div class="text">${moment.unix(renewalDate).format("DD MMM YYYY")}</div>
									</div>
								</div>
							</div>
						</div>
					`);
					;
				}
			});
		;
	}
});