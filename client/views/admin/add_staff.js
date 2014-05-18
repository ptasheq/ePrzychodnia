Template.addStaff.rendered = function () {
	/*$(".form-horizontal").validate();
	$.validator.messages.required = 'To pole jest wymagane';
	$.validator.messages.email = 'Proszę wprowadzić poprawny adres email';
	$.validator.messages.minlength = 'Proszę wprowadzić co najmniej 8 znaków';
	$.validator.messages.equalTo = 'Hasła się nie zgadzają';*/
};

Template.addStaff.events({
	'submit form': function (e) {
		e.preventDefault();
		var userData = {
			email: $(e.target).find('[name=email]').val(),
			password: $(e.target).find('[name=password]').val(),
			profile: {
				firstname: $(e.target).find('[name=firstname]').val(),
				lastname: $(e.target).find('[name=lastname]').val(),
				profession: $(e.target).find('[name=profession]').val(),
				role: roles.Staff
			}
		};
		// @TODO security issue
		Meteor.call('addNewUser', userData, function (error, result) {
			if (error) {
				throwError(error.reason);
			}
		});
	}
});