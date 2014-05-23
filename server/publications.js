Meteor.publish('users', function(role) {

	if(!role) {
		throw new Meteor.Error(401, 'Serwer otrzymał nieprawidłowe dane użytkowników!');
	}

	// we have to have admin or staff privilege to find staff
	if (!this.userId || !Roles.userIsInRole(this.userId, [roles.Admin]) 
	    && role.indexOf(roles.Staff) > -1) {
		throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
	}

	// we have to have admin or staff privilege to find patients
	if (!Roles.userIsInRole(this.userId, [roles.Admin, roles.Staff])
	    && role.indexOf(roles.Patient) > -1) {
		throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć odpowiednie uprawnienia');
	}

	return Users.find({roles: role}, {services: 0});
});