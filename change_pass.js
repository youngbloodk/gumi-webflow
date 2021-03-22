$(document).ready(function () {
	$(document)
		.on('click', '#changePassSubmit', async function (e) {
			e.preventDefault();
			$('#errorMessage').hide();

			const $email = $('#email').val();
			const $currentPass = $('#currentPass').val();
			const $newPass = $('#newPass').val();

			await signIn($email, $currentPass).then(async res => {
				if (res.error) {
					$('#errorMessage').show();
					$('#errorMessageText').text(res.error.replace('Server:', ''));
				} else {
					await changePass(res.token, $currentPass, $newPass)
						.then(function (res) {
							if (res.error) {
								$('#errorMessage').show();
								$('#errorMessageText').text(res.error.replace('Server:', ''));
							} else {
								$('#changePass').hide();
								$('#successMessage').show();
								setTimeout(() => {
									signOut();
									location.href = '/signin';
								}, 2000);
							}
						});
					;
				}
			});
		});
	;
});