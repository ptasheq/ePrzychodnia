Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading'
});

var roleUrls = function() {
	if (Accounts.loginServicesConfigured()) {
		var currentUser = Meteor.user();
		var name = Router.current().path;

		if (!currentUser) {
			this.redirect('/');	
			return;
		}

		var role = (function() {
			for (var i in roles) {
				if (Roles.userIsInRole(currentUser, [roles[i]])) {
					if (i === roles.Office)
						return roles.Staff;
					return roles[i];
				}
			}
		}());

		// url doesn't match our role we redirect to role index, patient is handled in next section
		if (name.indexOf(role) !== 1 && role !== roles.Patient) {
			this.redirect('/' + role);
			return;
		}

		if (Router.current().route.name === 'notFound') {
			if (role === roles.Patient) {
				this.redirect('/');
			}
			else {
				this.redirect('/' + role)
			}
			return;
		}
	}
}

Router.map(function() {
	this.route('patientIndex', {
		path: '/'
	});

	this.route('patientContact', {
		path: '/contactData'
	});

	this.route('patientVisit', {
		path: '/arrangeVisit',
		waitOn: function() {
			if (Meteor.userId()) { 
				return [Meteor.subscribe('users', roles.Staff), Meteor.subscribe('visits')];
			}
		}
	});

	this.route('adminIndex', {
		path: '/admin'
	});

	this.route('addStaff', {
		path: '/admin/addStaff'
	});

	this.route('addPatient', {
		path: '/admin/addPatient'
	});

	this.route('staffAddPatient', {
		path: '/staff/addPatient'
	});

	this.route('confirmVisits', {
		path: '/staff/confirmVisits',
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

	this.route('showHistory', {
		path: '/:role/showHistory/:_id',
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('visits'), Meteor.subscribe('users', roles.Patient)];
			}
		},
		data: function() {
			return Users.findOne(this.params._id);
		}
	});

	this.route('showPatient', {
		path: '/:role/showPatient',
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
		}
	});

	this.route('notFound', {
		path: '*'
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
Router.onBeforeAction(roleUrls);
//Router.onBeforeAction(requireAdmin, {only: ['addStaff', 'addPatient']});
//Router.onBeforeAction(requirePatient, {only: ['patientContact', 'patientVisit']});
//Router.onBeforeAction(requireStaff, {only: ['staffAddPatient', 'confirmVisits']});