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

	this.route('staffIndex', {
		path: '/staff',
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

Router.onBeforeAction(function() {clearErrors()});
Router.onBeforeAction('loading');
Router.onBeforeAction(requireAdmin, {only: 'addStaff'})
//Router.onBeforeAction(foo);