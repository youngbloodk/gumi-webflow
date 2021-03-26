$(document).ready(function () {
	if (signedIn) {
		renderSubscriptions();
	}
	$(document)
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
	;

	function renderPausedSubRenewalDate(target) {
		let date = moment(target.closest('[data-stripeitemid]').find('[data-id="renewal-date"]').text()).add(parseFloat($('#pauseDuration').val()), 'months').format('D MMM YYYY');
		$('#pauseSubRenewalDate').text(date);
	}

	async function renderSubscriptions() {
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
				};
			});
		;
	}
});