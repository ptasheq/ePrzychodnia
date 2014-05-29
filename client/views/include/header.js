Template.header.helpers({
	isAdminSite: function() {
		var tmp = Router.current();
		return tmp && tmp.path.split('/')[1] === 'admin'; 
	},
	isStaffSite: function() {
		var tmp = Router.current();
		return tmp && tmp.path.split('/')[1] === 'staff'; 
	},
	isPatientSite: function() {
		var tmp = Router.current();
		return tmp && $.inArray(tmp.path.split('/')[1], ['admin', 'staff']) === -1; 
	}
});

Template.header.events({
	'click .logout': function (e) {
		e.preventDefault();
		Meteor.logout();
	}
});
