$(document).ready(function() {
	if(signedIn) {
		renderSubscriptions();
	}
	const errorText = 'Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com';

	$(document)
		//update subscription
		.on('click', '[data-modalopen="Update-subscription"]', async function() {
			let sub = $(this).closest('[data-stripeitem]');
			let sub_id = sub.attr('data-stripeitem');
			let sub_items = JSON.parse(decodeURI(sub.attr('data-subitems')));
			let freq = parseInt(sub.attr('data-frequency'));
			let renewal_date = sub.attr('data-periodend');
			$('.loader-wrap').show();
			renderSubItems(sub_items, 'update')
				.then(items => {
					$('#updateSubItemsList').empty().append(items.toString().replaceAll(',', ''));
					const $items = $('#updateSubItemsList').find('[data-subitem]');
					for(const item of $items) {
						$(item).find('select').val($(item).attr('data-currentquant'));
					}
					$('.loader-wrap').fadeOut();
				});
			$('#updatedSubFrequency').val(freq);
			$('#updatedSubRenewalDate').text(renewal_date);
			await getSubitemOptions(sub_id)
				.then(options => {
					localStorage.setItem('gumiUpdateSubscriptionOptions', JSON.stringify(options.success));
				});
		})
		.on('click', '#addSubItemsButton', function() {
			let options = JSON.parse(localStorage.getItem('gumiUpdateSubscriptionOptions'));
			let optionsList = [];
			for(const option of options) {
				optionsList.push(`
					<option value="${option.price_id}">${option.name}</option>
				`);
			}
			$('#updateSubItemsList').append(`
				<div data-id="add_item" style="padding-bottom:10px; margin-bottom:10px;">
					<div class="w-layout-grid grid _2col _1fr-auto">
						<div class="w-layout-grid grid _2col auto-1fr">
							<div class="cell a-center j-center">
								<a data-id="remove_sub_item" class="font-awesome _14"></a>
							</div>
							<div class="select-wrapper small black" style="height:40px; border-radius:8px;" >
								<select class="field select white" name="item" style="padding-left:10px;">
									${optionsList}
								</select>
								<div style="right:10px; position:absolute;" class="font-awesome _14"></div>
							</div>
						</div>
						<div class="select-wrapper small black" style="height:40px; width:60px; border-radius:8px;">
							<select class="field select white" name="quantity" style="padding-left:10px;">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
							</select>
							<div style="right:10px; position:absolute;" class="font-awesome _14"></div>
						</div>
					</div>
				</div>
			`);
		})
		.on('click', '[data-id="remove_sub_item"]', function() {
			$(this).closest('[data-id="add_item"]').remove();
		})
		.on('click', '#updateSubscriptionConfirm', async function(e) {
			e.preventDefault();
			const $form = $(this).closest('[data-stripeitem]');
			const data = {
				sub_id: $('#updateSubscriptionForm').attr('data-stripeitem'),
				freq: $('#updatedSubFrequency').val(),
				update_items: [],
				add_items: []
			};

			$form.find('.error-message').hide();

			for(const item of $('#updateSubItemsList [data-subitem]')) {
				data.update_items.push({
					id: $(item).attr('data-subitem'),
					quant: parseFloat($(item).find('[data-id="update_item_quant"]').val())
				});
			}

			await updateSubscription(data)
				.then(res => {
					console.log(res);
					if(res.success) {
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(errorText);
						$form.find('.error-message').show();
					}
				});
		})
		//pause subscription
		.on('click', '[data-modalopen="Pause-subscription"]', function() {
			renderPauseSubRenewalDate($(this));
		})
		.on('change', '#pauseDuration', function() {
			renderPauseSubRenewalDate($('#subscriptionsList').find(`[data-stripeitem="${$(this).closest('[data-stripeitem]').attr('data-stripeitem')}`));
		})
		.on('click', '#pauseSubscriptionConfirm', function(e) {
			e.preventDefault();

			const $duration = parseFloat($('#pauseDuration').val());
			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');
			const renewaldate = moment($('#pauseSubRenewalDate').text()).add(1, 'days').format('MMM D, YYYY');

			$form.find('.error-message').hide();
			pauseSubscription($subId, renewaldate)
				.then(res => {
					if(res.success) {
						$('#pausedSubRenewalDate').text(renewaldate);
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(errorText);
						$form.find('.error-message').show();
					}
				});
		})
		//resume subscription
		.on('click', '[data-modalopen="Resume-subscription"]', function() {
			$('#resumeSubRenewalDate, #resumedSubRenewalDate').text($(this).closest('[data-stripeitem]').attr('data-periodend'));
			$('#resumeSubRenewalTotal').text($(this).closest('[data-stripeitem]').find('[data-id="renewal-amount"]').text());
		})
		.on('click', '#resumeSubscriptionConfirm', function(e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');

			$form.find('.error-message').hide();
			resumeSubscription($subId)
				.then(res => {
					if(res.success) {
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(errorText);
						$form.find('.error-message').show();
					}
				});
			;
		})
		//cancel subscription
		.on('click', '#cancelSubscriptionConfirm', function(e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');
			let reason = {
				reason: $('[name="cancellation-reason"]:checked').val(),
				comment: $('#cancelation_comment').val()
			};

			$form.find('.error-message').hide();
			cancelSubscription($subId, reason)
				.then(res => {
					if(res.success) {
						$form.find('form').hide();
						$form.find('.success-message').show();
					} else {
						$('.button-loader').hide();
						$form.find('.text.error').text(errorText);
						$form.find('.error-message').show();
					}
				});
			;
		})
		;
	;
});