loginUser = function(e) {
	e.preventDefault();
	var login = $(e.target).find('[name=email]').val();
	var password = $(e.target).find('[name=password]').val();

	Meteor.loginWithPassword(login, password, function (error) {
		error.reason = 'Podane dane logowania są błędne!';
		notify(error);
	});
}