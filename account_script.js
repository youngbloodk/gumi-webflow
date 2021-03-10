$(document).ready(function () {

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
            $('.renewal-date-text').text('Subscription paused');
        })
        //show cancel modal
        .on('click', '.cancel-modal-open', function () {
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
        ;
});