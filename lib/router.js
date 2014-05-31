Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading'
});

Router.map(function() {
	this.route('patientIndex', {
		path: '/',
		data: function() {
			return {
			}
		}
	});

	this.route('patientContact', {
		path: '/contactData',
		data: function() {
			return {
			}
		}
	});

	this.route('patientVisit', {
		path: '/arrangeVisit',
		data: function() {
			return {
			}
		},
		waitOn: function() {
			if (Meteor.userId()) { 
				return [Meteor.subscribe('users', roles.Staff), Meteor.subscribe('visits')];
			}
		}
	});

	this.route('adminIndex', {
		path: '/admin',
		data: function() {
			return {
			}
		}
	});

	this.route('addStaff', {
		path: '/admin/addStaff',
		data: function() {
			return {

			}
		}
	});

	this.route('addPatient', {
		path: '/admin/addPatient',
		data: function() {	
			return {
			}
		}
	});

	this.route('staffAddPatient', {
		path: '/staff/addPatient',
		data: function() {	
			return {
			}
		}
	});

	this.route('confirmVisits', {
		path: '/staff/confirmVisits',
		data: function() {	
			return {
			}
		},
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('users', roles.Patient), Meteor.subscribe('visits')];
			}
		}
	});

	this.route('viewVisits', {
		path: '/staff/viewVisits',
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('users', roles.Patient), Meteor.subscribe('visits')];
			}
		}
	});

	this.route('editVisits', {
		path: '/staff/editVisits/:_id',
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('singleVisit', this.params._id), Meteor.subscribe('users', roles.Patient)];
			}
		},
		data: function() {
			return Visits.findOne(this.params._id);
		}
	});

	this.route('showPatient', {
		path: '/admin/showPatient',
		data: function() {
			return {
			}
		},
		waitOn: function() {
			if (Meteor.userId()) {
				return Meteor.subscribe('users', roles.Patient);
			}
		}
	});

	this.route('staffIndex', {
		path: '/staff',
		onBeforeAction: function() {
			if (Meteor.userId()) {
				Router.go('/staff/viewVisits')
			}
		},
		data: function() {	
			return {
			}
		}
	});
});

var requireAdmin = function() {
	var currentUser = Meteor.user();
	if (Accounts.loginServicesConfigured()) {
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Admin])) {
			this.redirect('/admin');
		}
	}
}

var requirePatient = function() {
	var currentUser = Meteor.user();
	if (Accounts.loginServicesConfigured()) {
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Patient])) {
			this.redirect('/');
		}
	}
}

var requireStaff = function() {
	var currentUser = Meteor.user();
	if (Accounts.loginServicesConfigured()) {
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Staff, roles.Office])) {
			this.redirect('/staff');
		}
	}
}

Router.onBeforeAction(function() {clearErrors()});
Router.onBeforeAction('loading');
Router.onBeforeAction(requireAdmin, {only: ['addStaff', 'showPatient', 'addPatient']});
Router.onBeforeAction(requirePatient, {only: ['patientContact', 'patientVisit']});
Router.onBeforeAction(requireStaff, {only: ['staffAddPatient', 'confirmVisits']});