$(document).ready(function () {
	if (signedIn) {
		renderSubscriptions();
	}
	const errorText = 'Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com';

	$(document)
		//update subscription
		.on('click', '[data-modalopen="Update-subscription"]', async function () {
			$('.loader-wrap').show();
			renderSubItems(JSON.parse(decodeURI($(this).closest('[data-stripeitem]').attr('data-subitems'))), 'update')
				.then(items => {
					$('#updateSubItemsList').empty().append(items.toString().replaceAll(',', ''));
					const $items = $('#updateSubItemsList').find('[data-subitem]');
					for (const item of $items) {
						$(item).find('select').val($(item).attr('data-currentquant'));
					}
					$('.loader-wrap').fadeOut();
				});
		})
		.on('click', '#addSubItemsButton', function () {
			let images = {};
			renderItemAddOptions($(this).closest('[data-stripeitem]').attr('data-stripeitem')).then(options => {
				$('#addSubItemsList').append(`
					<div class="w-layout-grid grid _3col auto-auto-1fr">
						<img src="" loading="lazy" width="60" sizes="(max-width: 479px) 17vw, 60px" alt="">
						<div class="w-layout-grid grid _1col row-gap-5">
							<div class= "select-wrapper small black">
								<select class="field select" style="color:black; font-size:16px; height:24px; padding-left:2px;" data-id="add_item_name">
									${options}
								</select>
								<div class="font-awesome _12" style="right:5px; color:black; position:absolute;"></div>
							</div>
							<div class="grid _2col column-gap-0 auto-1fr a-center">
								<div class="text">Quantity:</div>
								<div class= "select-wrapper small black" style = "width:40px; margin-left:5px;">
									<select class="field select" style="color:black; font-size:16px; height:24px; padding-left:2px;" data-id="add_item_quant">
										<option value="0">0</option>
										<option value="1">1</option>
										<option value="2">2</option>
										<option value="3">3</option>
										<option value="4">4</option>
										<option value="5">5</option>
										<option value="6">6</option>
									</select>
									<div class="font-awesome _12" style="right:5px; color:black; position:absolute;"></div>
								</div>
							</div>
							<div class="text">Delivered: Every variable</div>
						</div>
						<div class="text right">$variable</div>
					</div>
					<div class="divider"></div>`);
			});

		})
		.on('click', '#updateSubscriptionConfirm', async function (e) {
			e.preventDefault();
			const $form = $(this).closest('[data-stripeitem]');
			const data = {
				sub_id: $('#updateSubscriptionForm').attr('data-stripeitem'),
				freq: $('#updatedSubFrequency').val(),
				update_items: [],
				add_items: []
			};

			$form.find('.error-message').hide();

			for (const item of $('#updateSubItemsList [data-subitem]')) {
				data.update_items.push({
					id: $(item).attr('data-subitem'),
					quant: parseFloat($(item).find('[data-id="update_item_quant"]').val())
				});
			}

			await updateSubscription(data)
				.then(res => {
					console.log(res);
					if (res.success) {
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
		.on('click', '[data-modalopen="Pause-subscription"]', function () {
			renderPauseSubRenewalDate($(this));
		})
		.on('change', '#pauseDuration', function () {
			renderPauseSubRenewalDate($('#subscriptionsList').find(`[data-stripeitem="${$(this).closest('[data-stripeitem]').attr('data-stripeitem')}`));
		})
		.on('click', '#pauseSubscriptionConfirm', function (e) {
			e.preventDefault();

			const $duration = parseFloat($('#pauseDuration').val());
			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');
			const renewaldate = moment($('#pauseSubRenewalDate').text()).add(1, 'days').format('MMM D, YYYY');

			$form.find('.error-message').hide();
			pauseSubscription($subId, renewaldate)
				.then(res => {
					if (res.success) {
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
		.on('click', '[data-modalopen="Resume-subscription"]', function () {
			$('#resumeSubRenewalDate, #resumedSubRenewalDate').text($(this).closest('[data-stripeitem]').attr('data-periodend'));
			$('#resumeSubRenewalTotal').text($(this).closest('[data-stripeitem]').find('[data-id="renewal-amount"]').text());
		})
		.on('click', '#resumeSubscriptionConfirm', function (e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');

			$form.find('.error-message').hide();
			resumeSubscription($subId)
				.then(res => {
					if (res.success) {
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
		.on('change', '[name="cancellation-reason"]', function () {
			if ($('[name="cancellation-reason"]:checked').val() == 'Other') {
				$('#otherReasonText').show();
			} else {
				$('#otherReasonText').hide();
			}
		})
		.on('click', '#cancelSubscriptionConfirm', function (e) {
			e.preventDefault();

			const $form = $(this).closest('[data-stripeitem]');
			const $subId = $form.attr('data-stripeitem');

			$form.find('.error-message').hide();
			cancelSubscription($subId)
				.then(res => {
					if (res.success) {
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