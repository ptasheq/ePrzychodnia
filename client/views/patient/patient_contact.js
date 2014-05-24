var events = {
	'submit form': function (e) {
		e.preventDefault();

		var phone = $(e.target).find('[name=phone]').val();
		var email = $(e.target).find('[name=email]').val();

		var userData = {'profile.contact.phone': phone, 'emails.0.address': email};
		if (!userData['emails.0.address']) {
			delete userData['emails.0.address'];
		}
		for (var i in userData) {
			if (!userData[i])
				delete userData[i];
		}
		console.log(userData);
		Meteor.users.update({_id: Meteor.user()._id}, {$set: userData});

	},
	'keyup form': function(e) {
		var inputs = $('.form-horizontal input');
		for (var i = 0; i < inputs.length; ++i) {
			if (inputs[i].value) {
				$('[type=submit]').removeAttr('disabled');
				return;
			}
		}
		$('[type=submit]').attr('disabled', 'disabled');
	}
};

Template.patientContact.rendered = function () {

	$('#patientContact').validate({
		rules: {
			phone: {phone: true}
		}
	});

	$.validator.addMethod('phone', function(phone, element) {
		return validationRules.phone(phone);
	});

	$.validator.messages.phone = 'Proszę wprowadzić poprawny numer telefonu';
	$.validator.messages.email = 'Proszę wprowadzić poprawny adres email';

}

Template.patientContact.events(events);