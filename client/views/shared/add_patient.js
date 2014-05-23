// @TODO phone validation

Template.addPatient.rendered = function () {
	$('[name=gender]').change(function() {
		if ($(this).find(":selected").val() == '-1') {
			$(this).css('color', '#919191')
		}
		else {
			$(this).css('color', '#555555')
		}
	});

	$.validator.addMethod('pesel', function(pesel, element) {
		return validatePesel(pesel);
	});

	$.validator.addMethod('pastDate', function(date, element) {
		return validateBirthDate(date);
	});

	$(".form-horizontal").validate({
		onsubmit: false,
		rules: {
			pesel: {
				pesel: true
			},
			'birth-date': {
				dateISO: true,
				pastDate: true
			},
			gender: {
				min: 0
			}
		}
	});
	$.validator.messages.required = 'To pole jest wymagane';
	$.validator.messages.email = 'Proszę wprowadzić poprawny adres email';
	$.validator.messages.minlength = 'Proszę wprowadzić co najmniej 8 znaków';
	$.validator.messages.equalTo = 'Hasła się nie zgadzają';
	$.validator.messages.pesel = 'PESEL jest niepoprawny';
	$.validator.messages.dateISO = 'Proszę wprowadzić poprawną datę';
	$.validator.messages.pastDate = 'Proszę podać wcześniejszą datę';
	$.validator.messages.min = 'Proszę wybrać płeć';
};

Template.addPatient.events({
	'submit form': function (e) {
		e.preventDefault();
		// pesel, password and gender have to be correct
		if ($('[name=pesel], [name=password], [name=gender]').valid()) {
			if ($('.form-horizontal').valid() || confirm('Niektóre dane są błędne, czy mimo to dodać?')) {
				$('label.error').remove();
				var userData = {
					username: $(e.target).find('[name=pesel]').val(),
					password: $(e.target).find('[name=password]').val(),
					profile: {
						gender: $(e.target).find('[name=gender]').val(),
						role: roles.Patient	
					}
				};

				if ($('[name=email]').valid()) {
					userData.email = $(e.target).find('[name=email]').val()
				}

				var loginInputs = '[name=pesel],[name=password],[name=email],[name=password-confirm]';
				var contactInputs = '[name=phone]';
				var trustedInputs = '[name=trusted-firstname],[name=trusted-lastname],[name=trusted-phone]';
				var inputs = $(e.target).find('input:not(' + loginInputs + ',' + contactInputs + ',' + trustedInputs + ')');
				for (var i = 0; i < inputs.length; ++i) {
					if (inputs[i].value) {
						userData.profile[inputs[i].name.replace('-', '_')] = inputs[i].value;
					}
				}
				inputs = $(e.target).find(contactInputs);
				userData.profile.contact = {};
				for (var i = 0; i < inputs.length; ++i) {
					if (inputs[i].value) {
						userData.profile.contact[inputs[i].name.replace('-', '_')] = inputs[i].value;
					}
				}
				inputs = $(e.target).find(trustedInputs);
				userData.profile.trusted = {};
				for (var i = 0; i < inputs.length; ++i) {
					if (inputs[i].value) {
						userData.profile.trusted[inputs[i].name.split('-')[1]] = inputs[i].value;
					}
				}	
				console.log(userData.email);
				// @TODO security issue
				Meteor.call('addNewUser', userData, function (error, result) {
					if (error) {
						throwError(error.reason);
					}
				});	
			}
		}

	}
});

Template.addPatient.helpers({
	gender: function () {
		return genders;
	}
});