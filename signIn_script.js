$(document).ready(function () {
    if (signedIn) {
        window.location.href = '/account';
    }
    $(document)
        .on('click', '#signInButton', async function (e) {
            const $email = $('#signInEmail').val();
            const $pass = $('#signInPassword').val();
            const $errorMessage = $('.error-message');
            const $errorMessageText = $('#errorMessageText');

            e.preventDefault();
            $errorMessage.hide();

            await signIn($email, $pass)
                .then(res => {
                    if (res.success) {
                        location.href = '/account';
                    } else {
                        $errorMessageText.html(res.error.replace('Server:', ''));
                        $errorMessage.show();
                    }
                });
            ;
        });
    ;
});