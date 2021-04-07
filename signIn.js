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
        .on('click', '#forgotPass', function() {
            $('.modal').fadeIn(250);
        })
        .on('click', '#forgotPassConfirm', function() {
            const $form = $(this).closest('.form');

            $form.find('.error-message').hide();
            resetPass($('#forgotPassEmail').val(), 'forgot_password').then(res => {
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
        .on('click', '[data-modal="close"]', function() {
            $('.modal').fadeOut(250);
        })
        ;
    ;
});