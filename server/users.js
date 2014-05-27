
Meteor.methods({
	addNewUser: function(user) {
		var currentUser = Meteor.user();
		// we have to have admin privilege to add staff members
		if (!currentUser || (!Roles.userIsInRole(currentUser, [roles.Admin]) 
		    && user.profile.role !== roles.Staff)) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
		}	
		// we have to have admin or staff privilege to add patients
		if (!Roles.userIsInRole(currentUser, [roles.Admin, roles.Office]) 
		    && user.profile.role !== roles.Patient) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć odpowiednie uprawnienia');
		}

		var currentRole = user.profile.role;
		delete user.profile.role;
		var userData = _.extend(_.pick(user, 'email'), user.profile);

		for (var item in userData) {
			// we have to check if we receive correct data from client, 
			// undefined means there's no validation rule
			if (validationRules[item] !== undefined && (!validationRules[item] || !validationRules[item](userData[item]))) {
				throw new Meteor.Error(401, 'Formularz zawiera nieprawidłowe dane!');
			}
		}
		var id = Accounts.createUser(user);
		if (!id) {
			throwError('Wystąpił błąd podczas tworzenia użytkownika. Być może podany email jest już w użyciu.');
		}
		Roles.addUsersToRoles(id, currentRole);
		return true;
	},

	deleteUser: function(id) {
		var currentUser = Meteor.user();


		// to delete we have to have office or admin privileges
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Admin, roles.Office])) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
		}

		var userToDeleteRole = Roles.getRolesForUser(id);
		if (userToDeleteRole.length === 0) {
			throw new Meteor.Error(401, 'Podany użytkownik nie istnieje!');
		}

		// office can delete only patients
		if (Roles.userIsInRole(currentUser, [roles.Office]) && userToDeleteRole !== roles.Patient) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
		}

		// nobody is allowed to delete office or admin
		if (_.intersection([roles.Office, roles.Admin], userToDeleteRole).length) {
			throw new Meteor.Error(401, 'Aby wykonać tę akcję musisz mieć uprawnienia administratora');
		}

		//Meteor.users.remove(id);
		console.log(userToDeleteRole);
		console.log('ok');
		return true;
	}
});
