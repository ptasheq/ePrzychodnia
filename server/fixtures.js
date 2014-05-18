if (Meteor.users.find().count() === 0) {
	// we'll use it during development
	var id = Accounts.createUser({email: 'admin@domain.com', password: 'admin!'}); 
	Roles.addUsersToRoles(id, roles.Admin);
}