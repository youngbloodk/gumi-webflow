$(document).ready(function () {
    if (signedIn) {
        window.location.href = '/account';
    }
    $(document)
        .on('click', '#signInButton', async function (e) {
            const $email = $('#signInEmail').val();
            const $pass = $('#signInPassword').val();
            const $errorMessage = $('.errorMessage');

            e.preventDefault();
            $errorMessage.hide();

            signIn($email, $pass)
                .then(res => {
                    if (res.success) {
                        location.href = '/account';
                    } else {
                        $errorMessage.show().html(res.error.replace('Server:', ''));
                    }
                });
            ;
        });
    ;
});