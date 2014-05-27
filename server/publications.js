Meteor.publish('users', function(role) {

	if (!this.userId) {
		throw new Meteor.Error(401, 'Musisz być zalogowanym, aby skorzystać z tej funkcji!');
	}

	if(!role) {
		throw new Meteor.Error(401, 'Serwer otrzymał nieprawidłowe dane użytkowników!');
	}

	if (Roles.userIsInRole(this.userId, [roles.Admin])) {
		return User.find({roles: role}, {services: 0});	
	}

	// as a patient we have only access to limited staff data 
	if (Roles.userIsInRole(this.userId, [roles.Patient]) && role.indexOf(roles.Staff) > -1) {
		return Users.find({roles: role}, {_id: 1, 'profile.firstname': 1, 
		                  'profile.lastname': 1, 'profile.profession': 1});
	}

	// we have to have admin or staff privilege to find patients
	if (Roles.userIsInRole(this.userId, [roles.Admin, roles.Staff, roles.Office]) && role.indexOf(roles.Patient) > -1) {
		return User.find({roles: role}, {services: 0});	
	}
	throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć odpowiednie uprawnienia');
});