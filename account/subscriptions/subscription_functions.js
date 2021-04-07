function renderPauseSubRenewalDate(target) {
	let $duration = parseFloat($('#pauseDuration').val());
	let date = moment(target.closest('[data-stripeitem]').find('[data-id="renewal-date"]').text())
		.add($duration, 'months')
		.subtract(1, 'days').format('MMM D, YYYY');
	$('#pauseSubRenewalDate').text(date);
}

async function renderSubscriptions() {
	await getSubscriptions(gumiAuth.token)
		.then(async subscriptions => {
			for (const subscription of subscriptions.subscriptions) {
				let total = 0.00;
				let taxRate;
				let tax = 0;
				let taxInfo = '';
				let subscriptionTitle = subscription.items.total_count > 1 ? `${subscription.items.total_count} items` : `${subscription.items.total_count} item`;
				let subItems = await renderSubItems(subscription.items.data);

				for (const subItem of subscription.items.data) {
					total += ((subItem.price.unit_amount * .01) * subItem.quantity);
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
				let pauseUpdateRenewButtons = `<a href="#" class="dropdown-menu-item" data-modalopen="Update-subscription"><span class="font-awesome _12"> &nbsp</span> Update subscription</a>
											<div class="divider no-margin"></div>
											<a href="#" class="dropdown-menu-item" data-modalopen="Pause-subscription"><span class="font-awesome _12"> &nbsp</span> Pause subscription</a>
											<div class="divider no-margin"></div>`;
				let subscriptionRenewalDetails = `Your subscription will renew on <span class="text bold" data-id="renewal-date">${moment.unix(subscription.current_period_end).format('MMM D, YYYY')}</span>`;

				if (subscription.pause_collection) {
					status = 'paused';
					renewalDate = subscription.pause_collection.resumes_at;
					pauseUpdateRenewButtons = `<a href="#" class="dropdown-menu-item" data-modalopen="Resume-subscription"><span class="font-awesome _12"> &nbsp</span> Resume subscription</a>
											<div class="divider no-margin"></div>`;
					subscriptionRenewalDetails = `Your subscription is paused until <span class="text bold" data-id="renewal-date">${moment.unix(subscription.pause_collection.resumes_at).format('MMM D, YYYY')}</span>, after which it will renew on it's original schedule`;
				}

				$('#subscriptionsList').append(`
						<div class="cell vertical card" data-stripeitem="${subscription.id}" data-periodend="${moment.unix(subscription.current_period_end).format('MMM D, YYYY')}" data-subitems="${encodeURI(JSON.stringify(subscription.items.data))}">
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
										<div class="text">${subscriptionRenewalDetails} for a total of <span class="text bold" data-id="renewal-amount">$${(total + tax).toFixed(2)}</span>.</div>
									</div>
								</div>
							</div>
						</div>
					`);
			};
		});
	;
}
async function renderSubItems(subItems, type) {
	let subItemsList = [];

	for (const subItem of subItems) {
		let quantity = `<div class="text" style="margin-left:5px;">${subItem.quantity}</div>`;
		if (type == 'update') {
			quantity =
				`<div class="select-wrapper small black" style="width:40px; margin-left:5px;">
						<select class="field select" style="color:black; font-size:16px; height:24px; padding-left:2px;" data-id="update_item_quant">
							<option value="0">0</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
							<option value="6">6</option>
						</select>
						<div class="font-awesome _12" style="right:5px; color:black; position:absolute;"></div>
					</div>`;
		}
		await getProduct(subItem.price.product)
			.then(product => {
				subItemsList.push(`
						<div class="w-layout-grid grid _3col auto-auto-1fr" data-subitem="${subItem.id}" data-currentquant="${subItem.quantity}">
							<img src="${product.images[0]}" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
							<div class="w-layout-grid grid _1col row-gap-5">
								<div class="text semibold">${product.name}</div>
								<div class="grid _2col column-gap-0 auto-1fr a-center">
									<div class="text">Quantity:</div>
									${quantity}
								</div>
								<div class="text">Delivered: Every ${subItem.price.recurring.interval_count} ${subItem.price.recurring.interval}</div>
							</div>
							<div class="text right">$${((subItem.price.unit_amount * .01) * subItem.quantity).toFixed(2)}</div>
						</div>
						<div class="divider"></div>`);
				;
			});
		;
	};
	return subItemsList;
}
async function renderItemAddOptions(sub_id) {
	let optionsList = [];

	await getSubitemOptions(sub_id)
		.then(options => {
			for (const option of options.success) {
				optionsList.push(`
					<option value="${option.price_id}">${option.name}</option>
				`);
			}
		});
	return optionsList;
}

/*data should be an object with subscription data to update
data = {
	sub_id: 'some_sub_id',
	freq: 2,
	update_items: [
		{
			id: 'some_item_id',
			quant: 4
		}
	],
	add_items: [
		{
			id: 'some_item_id',
			quant: 4
		}
	]
};
*/
async function updateSubscription(data) {
	const response = {
		success: []
	};
	for (const item of data.update_items) {
		if (item.quant > 0) {
			await updateSubItemQuantity(item.id, item.quant)
				.then(res => {
					response.success.push({ quant_update: res });
				});
		} else if (item.quant === 0) {
			await deleteSubItem(item.id)
				.then(res => {
					response.success.push({ removed: res });
				});
		}
	}
	updateSubFreq(data.sub_id, data.freq)
		.then(res => {
			response.success.push({ freq_update: res });
		});;
	return response;
}