var staffValidationRules = {
	firstname: function(data) {
		return data.length > 1;
	},
	lastname: function(data) {
		return data.length > 1;
	},
	email: function(data) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(data);
	},
	profession: function(data) {
		return data.length > 0;
	}
};

Meteor.methods({
	addNewUser: function(user) {
		var currentUser = Meteor.user();
		// we have to have admin privilege to add staff members
		if (!currentUser || (!Roles.userIsInRole(currentUser, [roles.Admin]) 
		    && user.profile.role !== roles.Staff)) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
		}	
		// we have to have admin or staff privilege to add patients
		if (!Roles.userIsInRole(currentUser, [roles.Admin, roles.Staff]) 
		    && user.profile.role !== roles.Patient) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć odpowiednie uprawnienia');
		}

		var validationRules = (user.profile.role === roles.Staff) ? staffValidationRules : null;
		var currentRole = user.profile.role;
		delete user.profile.role;
		var userData = _.extend(_.pick(user, 'email'), user.profile);

		for (var item in userData) {
			// we have to check if we receive correct data from client
			if (!validationRules[item] || !validationRules[item](userData[item])) {
				throw new Meteor.Error(401, 'Formularz zawiera nieprawidłowe dane!');
			}
		}
		var id = Accounts.createUser(user);
		if (!id) {
			throwError('Wystąpił błąd podczas tworzenia użytkownika. Być może podany email jest już w użyciu.');
		}
		Roles.addUsersToRoles(id, currentRole);
		return true;
	}
});
