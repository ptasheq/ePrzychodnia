if (Meteor.users.find().count() === 0) {
	// we'll use it during development
	var id = Accounts.createUser({email: 'admin@domain.com', password: 'admin!'}); 
	Roles.addUsersToRoles(id, roles.Admin);

	id = Accounts.createUser({email: 'office@domain.com', password: 'office!'});
	Roles.addUsersToRoles(id, roles.Office);

	icd9 = JSON.parse(Assets.getText('icd9.json'));
	icd10 = JSON.parse(Assets.getText('icd10.json'));
	meds = JSON.parse(Assets.getText('meds.json'));

	if (Icd9.find().count() === 0)	{
		Icd9._ensureIndex({subcategoryTitle: 1, subcategory: 1}, {unique: 1});
		_.each(icd9, function(item) {Icd9.insert(item);});
	}

	if (Icd10.find().count() === 0) {
		Icd10._ensureIndex({name: 1, code: 1}, {unique: 1});
		_.each(icd10, function(item) {Icd10.insert(item);});
	}

	if (Meds.find().count() === 0) {
		Meds._ensureIndex({ingredients: 1, name: 1});
		_.each(meds, function(item) {Meds.insert(item);});
	}
}