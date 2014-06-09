Template.header.rendered = function () {

};

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
	},
	'mouseenter li.dropdown': function(e) {
		if (!$(e.currentTarget).hasClass('open')) {
			$(e.currentTarget).addClass('open');
		}
	},
	'mouseleave li.dropdown': function(e) {
		if ($(e.currentTarget).hasClass('open')) {
			$(e.currentTarget).removeClass('open');
		}
	}
});
