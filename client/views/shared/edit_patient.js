// @TODO phone validation

Template.editPatient.rendered = function () {
	$('[name=gender]').change(function() {
		if ($(this).find(":selected").val() == '-1') {
			$(this).css('color', '#919191')
		}
		else {
			$(this).css('color', '#555555')
		}
	});

	$.validator.addMethod('pesel', function(pesel, element) {
		return validationRules.pesel(pesel);
	});

	$.validator.addMethod('pastDate', function(date, element) {
		return validationRules.birthDate(date);
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

Template.editPatient.events({
	'submit form': function (e) {
		e.preventDefault();
		// pesel, password and gender have to be correct, but password can be empty - no change
		if ($('[name=pesel], [name=password], [name=gender]').valid() || $('[name=password]').val() === '') {
			if ($('.form-horizontal').valid() || confirm('Niektóre dane są błędne, czy mimo to dodać?')) {
				$('label.error').remove();
				var userData = {
					username: $('[name=pesel]').val(),
					profile: {
						gender: $('[name=gender]').val(),
						role: roles.Patient	
					}
				};


				if ($('[name=password]').val() !== '') {
					userData.password = $('[name=password]').val();
				}
				if ($('[name=email]').valid() && $('[name=email]').val() != '') {
					userData['emails'] = $('[name=email]').val()
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
				var id = (Meteor.userId() === this._id) ? null : this._id;
				Meteor.call('editUser', userData, id, function(error, result) {
					notify(error, result);	
				});
			}
		}

	}
});

Template.editPatient.helpers({
	gender: function() {
		return genders;
	},
	selectGender: function(gender) {
		if (this.profile) {
			return (this.profile.gender == gender) ? 'selected' : null; 
		}
	},
	getId: function() {
		return this._id;
	}
});