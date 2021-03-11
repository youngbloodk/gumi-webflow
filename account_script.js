$(document).ready(function () {
	let currentUser;
	init();

	$(document)
		//show account update info
		.on('click', '#accountUpdateButton', function () {
			$('#accountUpdateButton').hide();
			$('#existingAccountInfo').hide();
			$('.account-info-update-form-wrap').show();
			$('.account-menu-dropdown').hide();
			$('#accountUpdateCancel').show();
		})
		//hide account update info
		.on('click', '#accountUpdateCancel', function () {
			$('#accountUpdateButton').show();
			$('#existingAccountInfo').show();
			$('.account-info-update-form-wrap').hide();
			$('.account-menu-dropdown').show();
			$('#accountUpdateCancel').hide();
		})
		.on('click', '#accountUpdateConfirm', function () {
			$('#existingAccountInfo').show();
			$('.account-info-update-form-wrap').hide();
			$('.account-menu-dropdown').show();
			$('#accountUpdateCancel').hide();
		})
		//show pause modal
		.on('click', '#pauseModalOpen', function () {
			$('#pauseModal').show();
		})
		//hide pause modal
		.on('click', '#pauseModalClose', function () {
			$('#pauseModal').hide();
		})
		.on('click', '#pauseSubscriptionConfirm', function () {
			$('#pauseModal').hide();
		})
		//show cancel modal
		.on('click', '#cancelModalOpen', function () {
			$('#cancelModal').show();
		})
		.on('change', 'input[name="cancellation-reason"]', function () {
			if ($(this).val() == 'Other') {
				$('#otherReasonText').show();
			} else {
				$('#otherReasonText').hide();
			}
		})
		//hide cancel modal
		.on('click', '#cancelModalClose', function () {
			$('#cancelModal').hide();
		})
		.on('click', '#cancelSubscriptionConfirm', function () {
			$('#cancelModal').hide();
		})
		//show update account modal
		.on('click', '#updateAccountModalOpen', function () {
			$('#updateAccountModal').show();
		})
		//hide update account modal
		.on('click', '#updateAccountModalClose', function () {
			$('#updateAccountModal').hide();
		});
	;

	async function init() {
		if (!signedIn) {
			window.location.href = '/signin';
		} else {
			currentUser = await getCustomer(JSON.parse($.cookie('gumiAuth')).email, JSON.parse($.cookie('gumiAuth')).token);
			$('[data-id="customerFirstName"]').html(await currentUser.first_name);
		}
	}
});