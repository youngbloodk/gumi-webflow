$(document).ready(function () {
	if (!signedIn) {
		window.location.href = '/account/signin';
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
		//dropdown menu handling
		.on('click', '.menu-dropdown', function () {
			$(this).closest('.menu-dropdown').find('.menu-dropdown-list').show();
		})
		.on('click', function (e) {
			if (!$(e.target).hasClass('menu-dropdown')) {
				$('.menu-dropdown-list').hide();
			}
		})
		//modal handling
		.on('click', '[data-modalopen]', function () {
			const modalInfo = $(this).attr('data-modalopen');
			$('#modalTitle').text(modalInfo.replaceAll('-', ' '));
			$(`[data-modalform]`).hide();
			$(`[data-modalform="${modalInfo}"]`).attr('data-stripeitemid', $(this).closest('[data-stripeitemid]').attr('data-stripeitemid')).show();
			$('.modal').fadeIn(250);
		})
		.on('click', '[data-modal="close"]', function () {
			$('.modal, [data-modalForm]').fadeOut(250);
			$(`[data-modalform]`).attr('data-stripeitemid', '');
			$('#modalTitle').text('');
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
		//pause subscription
		.on('click', '[data-modalopen="Pause-subscription"]', function () {
			renderPausedSubRenewalDate($(this));
		})
		.on('change', '#pauseDuration', function () {
			renderPausedSubRenewalDate($('#subscriptionsList').find(`[data-stripeitemid="${$(this).closest('[data-stripeitemid]').attr('data-stripeitemid')}`));
		})
		.on('click', '#pauseSubscriptionConfirm', function (e) {
			e.preventDefault();

			const $duration = parseFloat($('#pauseDuration').val());
			const $form = $(this).closest('[data-stripeitemid]');
			const $subId = $form.attr('data-stripeitemid');
			const renewaldate = $('#pauseSubRenewalDate').text();

			$form.find('.error-message').hide();
			pauseSubscription($subId, renewaldate)
				.then(res => {
					if (res.success) {
						$('#pausedSubRenewalDate').text(renewaldate);
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(res.error);
						$form.find('.error-message').show();
					}
				});
		})
		//resume subscription
		.on('click', '[data-modalopen="Resume-subscription"]', function () {
			$('#resumeSubRenewalDate').text($(this).closest('[data-stripeitemid]').find('[data-id="renewal-date"]').text());
			$('#resumeSubRenewalTotal').text($(this).closest('[data-stripeitemid]').find('[data-id="renewal-amount"]').text());
		})
		.on('click', '#resumeSubscriptionConfirm', function (e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitemid]');
			const $subId = $form.attr('data-stripeitemid');

			$form.find('.error-message').hide();
			resumeSubscription($subId)
				.then(res => {
					if (res.success) {
						$('#resumedSubRenewalDate').text(renewaldate);
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(res.error);
						$form.find('.error-message').show();
					}
				});
		})
		;

	//functions
	function renderPausedSubRenewalDate(target) {
		let date = moment(target.closest('[data-stripeitemid]').find('[data-id="renewal-date"]').text()).add(parseFloat($('#pauseDuration').val()), 'months').format('D MMM YYYY');
		$('#pauseSubRenewalDate').text(date);
	}
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
					const cardIcons = {
						visa: "",
						amex: "",
						mastercard: "",
						jcb: "",
						discover: "",
						unionpay: ""
					};
					$('#paymentMethodsList').prepend(`
						<div class="w-layout-grid grid payment-method-card" data-stripeitemid="${method.id}">
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
									<a href="#" class="dropdown-menu-item" data-modalopen="Update-payment-method"><span class="font-awesome _12"> &nbsp</span>Update billing info</a>
									<div class="divider no-margin"></div>
									<a href="#" class="dropdown-menu-item" data-modalopen="Remove-payment-method"><span class="font-awesome"> &nbsp</span>Remove card</a>
								</div>
							</div>
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
						taxInfo = `<div class="w-layout-grid grid _1col row-gap-0">
										<div class="w-layout-grid grid _2col _1fr-auto">
											<div class="text">Tax:</div>
											<div class="text right">$${tax}</div>
										</div>
										<div class="w-layout-grid grid _2col _1fr-auto">
											<div class="text bold">Total:</div>
											<div class="text right bold">$${(total + tax).toFixed(2)}</div>
										</div>
									</div>
									<div class="divider no-margin"></div>
									`;
					}

					let status = 'active';
					let renewalDate = subscription.current_period_end;
					let pauseUpdateRenewButtons = `<a href="#" class="dropdown-menu-item" data-modalopen="Update-subscription"><span class="font-awesome _12"> &nbsp</span> Update subscription</a>
											<div class="divider no-margin"></div>
											<a href="#" class="dropdown-menu-item" data-modalopen="Pause-subscription"><span class="font-awesome _12"> &nbsp</span> Pause subscription</a>
											<div class="divider no-margin"></div>`;

					if (subscription.pause_collection) {
						status = 'paused';
						renewalDate = subscription.pause_collection.resumes_at;
						pauseUpdateRenewButtons = `<a href="#" class="dropdown-menu-item" data-modalopen="Resume-subscription"><span class="font-awesome _12"> &nbsp</span> Resume subscription</a>
											<div class="divider no-margin"></div>`;
						// <a href="#" class="dropdown-menu-item"><span class="font-awesome _12"> &nbsp</span> Change renewal date</a>
						// <div class="divider no-margin"></div>
					}

					$('#subscriptionsList').append(`
						<div class="cell vertical card" data-stripeitemid="${subscription.id}">
							<div class="cell-header">
								<div class="w-layout-grid grid _2col auto a-center">
									<div class="h5">${subscriptionTitle}</div>
									<div class="cell tag ${status}">
										<div id="discountName" class="text tag light">${status.charAt(0).toUpperCase()}${status.slice(1)}</div>
									</div>
								</div>
								<div class="menu-dropdown">
									<div class="text menu-dropdown"><span class="font-awesome _12 menu-dropdown"></span> Edit</div>
									<div class="menu-dropdown-list">
										${pauseUpdateRenewButtons}
										<a href="#" class="dropdown-menu-item" data-modalopen="Cancel-subscription"><span class="font-awesome _12"> &nbsp</span>Cancel subscription</a>
									</div>
								</div>
							</div>
							<div class="cell-content footer">
								<div class="w-layout-grid grid _1col row-gap-10">
									<div data-subscription="items-list" class="w-layout-grid grid _1col row-gap-0">
										${await subItems.toString().replaceAll(',', '')}
									</div>
									${taxInfo}
									<div class="w-layout-grid grid _1col row-gap-0">
										<div class="text bold">Subscription Details</div>
										<div class="text">Your subscription will renew on <span class="text bold" data-id="renewal-date">${moment.unix(renewalDate).format("DD MMM YYYY")}</span> for a total of <span class="text bold" data-id="renewal-amount">$${(total + tax).toFixed(2)}</span>.</div>
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