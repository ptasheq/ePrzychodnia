loginUser = function(e) {
	e.preventDefault();
	var login = $(e.target).find('[name=email]').val();
	var password = $(e.target).find('[name=password]').val();

	Meteor.loginWithPassword(login, password, function (error) {
		if (error) {
			error.reason = errors.incorrectForm;
			notify(error);
		}
	});
}