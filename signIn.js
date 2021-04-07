$(document).ready(function() {
    if(signedIn) {
        location.href = '/account';
    }
    $(document)
        .on('click', '#signInButton', async function(e) {
            const $email = $('#signInEmail').val();
            const $pass = $('#signInPassword').val();
            const $errorMessage = $('.error-message');
            const $errorMessageText = $('#errorMessageText');

            e.preventDefault();
            $errorMessage.hide();

            await signIn($email, $pass)
                .then(res => {
                    if(res.success) {
                        if(getURLParam('redirect') && document.referrer.indexOf(location.host) > 0) {
                            location.href = document.referrer;
                        } else {
                            location.href = '/account';
                        }
                    } else {
                        $errorMessageText.html(res.error.replace('Server:', ''));
                        $errorMessage.show();
                    }
                });
            ;
        })
        .on('click', '#forgot_password, #activate_account', function() {
            $('.modal').fadeIn(250);
            $('#resetPassConfirm').attr('data-reason', $(this).attr('id'));
        })
        .on('click', '#resetPassConfirm', function() {
            const $form = $(this).closest('.form');

            $form.find('.error-message').hide();
            resetPass($('#resetPassEmail').val(), $('#resetPassConfirm').attr('data-reason')).then(res => {
                if(res.success) {
                    $form.find('form').hide();
                    $form.find('.success-message').show();
                } else {
                    $('.button-loader').hide();
                    $form.find('.text.error').text(res.error);
                    $form.find('.error-message').show();
                }
            });
        })
        .on('click', '[data-modal="close"]', function() {
            $('.modal').fadeOut(250);
        })
        ;
    ;
});