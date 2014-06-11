Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading'
});

var roleUrls = function() {
	if (Accounts.loginServicesConfigured()) {
		var currentUser = Meteor.user();
		var path = Router.current().path;
		var name = Router.current().route.name;
		var role = Roles.getRolesForUser(currentUser)[0];

		if (!role) {
			if (_.without(path.split('/'), '').length > 1 || ['patientIndex', 'addPatient', 'adminIndex', 'staffIndex'].indexOf(name) == -1) {
				this.redirect('/');
			}
		}
		else if ([roles.Admin, roles.Staff, roles.Office].indexOf(role) > -1) {
			var tmpRole = (role === roles.Office) ? roles.Staff : role;
			if (path.split('/')[1] !== tmpRole || name === 'notFound') {
				this.redirect('/' + tmpRole);
			}
		}

		else if ([roles.Patient, roles.PatientTobe].indexOf(role) > -1) {
			if (['editPatient', 'showHistory'].indexOf(name) === -1 && (_.without(path.split('/'), '').length > 1 || dynamicRoutes.indexOf(name) > -1)) {
				this.redirect('/');
			} 
			else if ((role === roles.PatientTobe && name === 'patientVisit') || name === 'notFound') {
				this.redirect('/');
			}
		}

	}
}

Router.map(function() {
	this.route('patientIndex', {
		path: '/'
	});

	this.route('editPatient', {
		path: '/:role?/editPatient/:_id?',
		waitOn: function() {
			if (this.params._id) {
				return [Meteor.subscribe('users', [roles.Patient, roles.PatientTobe])];
			}
		},
		data: function() {
			if (!this.params._id) {
				return Meteor.user();
			}
			return Users.findOne({_id: this.params._id});
		}
	});

	this.route('patientVisit', {
		path: '/arrangeVisit',
		waitOn: function() {
			if (Meteor.userId()) { 
				return [Meteor.subscribe('users', [roles.Staff]), Meteor.subscribe('visits')];
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
		path: '/:role?/addPatient'
	});

	this.route('confirmVisits', {
		path: '/staff/confirmVisits/:_id?',
		waitOn: function() {
			var id = Meteor.userId();
			if (id) {
				return [Meteor.subscribe('users', [roles.Patient, roles.Staff]), Meteor.subscribe('visits', {confirmed: false, id: (this.params._id) ? this.params._id : id})];
			}
		}
	});

	this.route('viewVisits', {
		path: '/staff/viewVisits/:_id?',
		waitOn: function() {
			var id = Meteor.userId();
			if (id) {
				return [Meteor.subscribe('users', [roles.Patient, roles.Staff]), Meteor.subscribe('visits', {confirmed: true, id: (this.params._id) ? this.params._id : id})];
			}
		},
		data: function() {
			if (this.params._id) {
				return Users.findOne(this.params._id);
			}
		}
	});

	this.route('editVisits', {
		path: '/staff/editVisits/:_id',
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('singleVisit', this.params._id), Meteor.subscribe('users', [roles.Patient])];
			}
		},
		data: function() {
			return Visits.findOne(this.params._id);
		}
	});

	this.route('showHistory', {
		path: '/:role?/showHistory/:_id',
		waitOn: function() {
			if (Meteor.userId()) {
				return [Meteor.subscribe('visits', {confirmed: true, id: this.params._id}), Meteor.subscribe('users', [roles.Patient])];
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
				return Meteor.subscribe('users', [roles.Patient, roles.PatientTobe]);
			}
		}
	});

	this.route('staffIndex', {
		path: '/staff',
		onBeforeAction: function() {
			var id = Meteor.userId();
			if (id) {
				if (Roles.userIsInRole(id, [roles.Staff])) {
					Router.go('/staff/viewVisits')
				}
				else {
					Router.go('/staff/showPatient');
				}
			}
		}
	});

	this.route('notFound', {
		path: '*'
	});

});

var dynamicRoutes = _.filter(Router.routes, function(route) {
	if (route.originalPath.indexOf(':') > -1) return route;
}).map(function(item) {return item.name});

Router.onBeforeAction(function() {clearNotifications()});
Router.onBeforeAction(roleUrls);
Router.onBeforeAction('loading');