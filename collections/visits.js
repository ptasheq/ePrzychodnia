Visits = new Meteor.Collection('visits');

Visits.deny({
	insert: function (userId, doc) {
		return !Roles.userIsInRole(userId, ['admin']);
	},
	update: function (userId, doc, fields, modifier) {
		return !Roles.userIsInRole(userId, ['admin']);
	},
	remove: function (userId, doc) {
		return !Roles.userIsInRole(userId, ['admin']);
	}
});