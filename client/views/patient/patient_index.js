Template.patientIndex.events({
	'submit form': function (e) {
		loginUser(e);
	}
});

Template.patientIndex.helpers({
	hasContactData: function () {
		var user = Meteor.user();
		return user.profile.contact.phone || user.emails[0].address;
	}
});