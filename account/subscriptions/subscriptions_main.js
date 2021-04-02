$(document).ready(function () {
	if (signedIn) {
		renderSubscriptions();
	}
	const errorText = 'Whoops, there appears to be an issue. If this keeps happening, please let us know support@guminutrition.com';

	$(document)
		//update subscription
		.on('click', '[data-modalopen="Update-subscription"]', async function () {
			renderSubItems(JSON.parse(decodeURI($(this).closest('[data-stripeitem]').attr('data-subitems'))), 'update').then(items => {
				$('#updateSubItemsList').empty().append(items.toString().replaceAll(',', ''));
				const $items = $('#updateSubItemsList').find('[data-subitem]');
				for (const item of $items) {
					$(item).find('select').val($(item).attr('data-currentquant'));
				}
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
			const renewaldate = moment(Date.parse($('#pauseSubRenewalDate').text())).add(1, 'days').format('MMM D, YYYY');

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