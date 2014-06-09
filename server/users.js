var allowedFields = {};
allowedFields[roles.Patient] = allowedFields[roles.PatientTobe] = function(data, editting) {
	if (data.profile.contact) {
		if (Object.getOwnPropertyNames(data.profile.contact).length > 0) {
			data.profile.contact = _.pick(data.profile.contact, ['phone']);
		}
		else {
			delete data.profile.contact;
		}
	}
	if (data.profile.trusted) {
		if (Object.getOwnPropertyNames(data.profile.trusted).length > 0) {
			data.profile.trusted = _.pick(data.profile.trusted, ['firstname', 'lastname', 'phone']);	
		}
		else {
			delete data.profile.trusted;
		}
	}
	data.profile = _.pick(data.profile, 
	                      ['birth_date', 'birth_place', 'contact', 'document_number', 
	                      'document_series',  'firstname', 'gender', 'lastname', 'trusted']);
	return editting ? _.pick(data, ['username', 'password', 'emails', 'profile']) : _.pick(data, ['username', 'password', 'email', 'profile']);
};

allowedFields[roles.Staff] = function(data) {
	if (Object.getOwnPropertyNames(data.profile).length > 0) {
		data.profile = _.pick(data.profile, ['firstname', 'lastname', 'profession']);
	}
	return _.pick(data, ['email', 'password', 'profile']);
}

Meteor.publish('users', function(role) {

	if (!this.userId) {
		throw new Meteor.Error(401, errors.login);
	}

	if(!role) {
		throw new Meteor.Error(401, 'Serwer otrzymał nieprawidłowe dane użytkowników!');
	}

	if (Roles.userIsInRole(this.userId, [roles.Admin])) {
		return Users.find({roles: {$in: role}}, {services: 0});	
	}

	// as a patient we have only access to limited staff data 
	if (Roles.userIsInRole(this.userId, [roles.Patient]) && role[0].indexOf(roles.Staff) > -1) {
		return Users.find({roles: {$in: role}}, {_id: 1, 'profile.firstname': 1, 
		                  'profile.lastname': 1, 'profile.profession': 1});
	}

	// we have to have admin or staff privilege to find patients
	if (Roles.userIsInRole(this.userId, [roles.Admin, roles.Staff, roles.Office])) {
		return Users.find({roles: {$in: role}}, {services: 0});	
	}
	throw new Meteor.Error(401, errors.privileges);
});

Meteor.methods({
	addNewUser: function(user) {
		var currentUser = Meteor.user();

		// checking correct object structure
		if (!user || !user.profile) {
			throw new Meteor.Error(401, errors.wrongData);
		}

		// we have to have admin privilege to add staff members
		if (!Roles.userIsInRole(currentUser, [roles.Admin])
		    && user.profile.role === roles.Staff) {
			throw new Meteor.Error(401, errors.admin);
		}	

		// adding admin or office is forbidden and patient can't do anything
		if ([roles.Admin, roles.Office].indexOf(user.profile.role) > -1 || Roles.userIsInRole(currentUser, [roles.Patient, roles.PatientTobe])) {
			throw new Meteor.Error(401, errors.privileges);
		}

		var currentRole = user.profile.role;

		// cleaning object from unnecessary fields
		if (!allowedFields[currentRole]) {
			throw new Meteor.Error(401, errors.wrongData);
		}
		user = allowedFields[currentRole](user);

		var userData = _.extend(_.pick(user, 'email'), user.profile);

		// if users register themselves they are unconfimred
		if (!currentUser) {
			currentRole = roles.PatientTobe;
		}

		for (var item in userData) {
			// we have to check if we receive correct data from client, 
			// undefined means there's no validation rule
			if (validationRules[item] !== undefined && (!validationRules[item] || !validationRules[item](userData[item]))) {
				throw new Meteor.Error(401, errors.incorrectForm);
			}
		}
		var id = Accounts.createUser(user);
		if (!id) {
			throw new Meteor.Error(401, errors.createUser);
		}

		Roles.addUsersToRoles(id, [currentRole]);

		return (currentRole === roles.Staff) ? successes.addStaff : successes.addPatient;
	},
	editUser: function(user, id) {
		var currentUser = Meteor.user();

		if (!id) {
			id = currentUser._id;
		}

		// checking correct object structure
		if (!user || !user.profile) {
			throw new Meteor.Error(401, errors.wrongData);
		}

		// we have to have admin privilege to edit staff members
		if (!Roles.userIsInRole(currentUser, [roles.Admin])
		    && Roles.userIsInRole(id, [roles.Staff])) {
			throw new Meteor.Error(401, errors.admin);
		}	

		// editing admin or office is forbidden
		if (Roles.userIsInRole(id, [roles.Admin, roles.Office])) {
			throw new Meteor.Error(401, errors.privileges);
		}

		// patients can only edit themselves
		if (Roles.userIsInRole(currentUser, [roles.Patient, roles.PatientTobe]) && id != currentUser._id) {
			throw new Meteor.Error(401, errors.privileges);
		}

		var currentRole = user.profile.role;

		// cleaning object from unnecessary fields
		user = allowedFields[currentRole](user);

		var userData = _.extend(_.pick(user, 'emails'), user.profile);

		for (var item in userData) {
			// we have to check if we receive correct data from client, 
			// undefined means there's no validation rule
			if (validationRules[item] !== undefined && (!validationRules[item] || !validationRules[item](userData[item]))) {
				throw new Meteor.Error(401, errors.incorrectForm);
			}
		}

		if (user['emails']) {
			user['emails'] = [{address: user['emails'], verified: 'false'}]
		}

		if (!Meteor.users.update({_id: id}, {$set: user})) {
			throw new Meteor.Error(401, errors.editUser);
		}

		if (Roles.userIsInRole(currentUser, [roles.Patient])) {
			Roles.setUserRoles(currentUser._id, [roles.PatientTobe]);
		}

		return successes.editUser;
	},
	confirmUser: function(id) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Admin, roles.Office, roles.Staff])) {
			throw new Meteor.Error(401, errors.privileges);
		}

		if (!Roles.userIsInRole(id, [roles.PatientTobe])) {
			throw new Meteor.Error(401, errors.wrongData);
		}
		Roles.setUserRoles(id, [roles.Patient]);

	},
	deleteUser: function(id) {
		var currentUser = Meteor.user();


		// to delete we have to have office or admin privileges
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Admin, roles.Office])) {
			throw new Meteor.Error(401, errors.admin);
		}

		var userToDeleteRole = Roles.getRolesForUser(id);
		if (userToDeleteRole.length === 0) {
			throw new Meteor.Error(401, errors.userNotExist);
		}

		// office can delete only patients
		if (Roles.userIsInRole(currentUser, [roles.Office]) && userToDeleteRole !== roles.Patient) {
			throw new Meteor.Error(401, errors.admin);
		}

		// nobody is allowed to delete office or admin
		if (_.intersection([roles.Office, roles.Admin], userToDeleteRole).length) {
			throw new Meteor.Error(401, errors.admin);
		}

		Meteor.users.remove(id);
		return successes.deleteUser;
	}
});
