$(document).ready(function () {
	if (signedIn) {
		currentUser.then(res => {
			$('#email').val(res.email);
		});
	}
	if (getURLParam('uuid')) {
		$('#currentPassWrap').hide();
	}

	$(document)
		.on('change', '#confirmPass', function () {
			let $newPass = $('#newPass').val();
			let $confirmPass = $('#confirmPass');
			let $submit = $('#changePassSubmit');
			if ($confirmPass.val() == $newPass) {
				$confirmPass.removeClass('invalid');
				$submit.prop('disabled', false);
			} else {
				$confirmPass.addClass('invalid');
				$submit.prop('disabled', true);
			}
		})
		.on('click', '#changePassSubmit', async function (e) {
			let $email = $('#email').val();
			let $currentPass = $('#currentPass').val();
			let $newPass = $('#newPass').val();

			e.preventDefault();
			$('#errorMessage').hide();

			if (getURLParam('uuid')) {
				uuidPassChange(getURLParam('uuid'), $newPass).then(res => {
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
			} else {
				await signIn($email, $currentPass).then(async res => {
					if (res.error) {
						$('#errorMessage').show();
						$('#errorMessageText').text(res.error.replace('Server:', ''));
					} else {
						await changePass(res.token, $currentPass, $newPass)
							.then(res => {
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
			}
		});
	;
});