$(document).ready(function () {
    if (signedIn) {
        window.location.href = '/account';
    }
    $(document)
        .on('click', '#signInButton', async function (ev) {
            ev.preventDefault();

            $('.errorMessage').hide();

            signIn($('#signInEmail').val(), $('#signInPassword').val())
                .then(response => {
                    if (response.success) {
                        window.location.href = '/account';
                    } else {
                        $('#errorMessage').show().html(response.error.replace('Server:', ''));
                    }
                });
        });
});