Users = Meteor.users;

Meteor.users.allow({
	update: function (userId, doc, fields, modifier) {
		// deny will filter anything we don't want
		return true;
	}
});

Meteor.users.deny({
	//@TODO update only allowed on patient
	update: function(userId, doc, fields, modifier) {
		// we should modify our doc and peform only set
		if (userId !== doc._id || !modifier['$set'] || _.keys(modifier).length !== 1) {
			return true;
		}

		// we modify only two fields
		if (_.without(_.keys(modifier['$set']), 'emails.0.address', 'profile.contact.phone').length > 0) {
			return true;
		}

		var email = modifier['$set']['emails.0.address'];
		var phone = modifier['$set']['profile.contact.phone'];

		return ((email && !validationRules.email(email)) || (phone && !validationRules.phone(phone)));
	}
});