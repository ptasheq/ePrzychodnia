Template.adminIndex.events({
	'submit form': function (e) {
		e.preventDefault();

		var login = $(e.target).find('[name=email]').val();
		var password = $(e.target).find('[name=password]').val();

		Meteor.loginWithPassword(login, password, function (error) {
			if (error) {
				throwError('Podane dane logowania są błędne!');
			}
			else {
				alert('Działa!');
			}
		});		
	}
});