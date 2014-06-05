Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading'
});

var roleUrls = function() {
	if (Accounts.loginServicesConfigured()) {
		var currentUser = Meteor.user();
		var path = Router.current().path;
		var name = Router.current().route.name;
		var role = (function() {
			for (var i in roles) {
				if (Roles.userIsInRole(currentUser, [roles[i]])) {
					if (i === roles.Office)
						return roles.Staff;
					return roles[i];
				}
			}
			return false;
		}());


		if (!role) {
			if (_.without(path.split('/'), '').length > 1 || (dynamicRoutes.indexOf(name) > -1 && name !== 'addPatient')) {
				this.redirect('/');
			}
		}

		else if ([roles.Admin, roles.Staff].indexOf(role) > -1) {
			if (path.split('/')[0] !== role) {
				this.redirect('/');
			}
		}

		else if ([roles.Patient, roles.PatientTobe].indexOf(role) > -1) {
			if (_.without(path.split('/'), '').length > 1 || (dynamicRoutes.indexOf(name) > -1 && name !== 'editPatient')) {
				this.redirect('/');
			} 
			else if (role === roles.PatientTobe && name === 'patientVisit') {
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
		path: '/:role?/editPatient/:_id?'
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
		path: '/:role?/addPatient'
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
				return [Meteor.subscribe('visits', this.params._id), Meteor.subscribe('users', roles.Patient)];
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

var dynamicRoutes = _.filter(Router.routes, function(route) {
	if (route.originalPath.indexOf(':') > -1) return route;
}).map(function(item) {return item.name});

Router.onBeforeAction(function() {clearNotifications()});
Router.onBeforeAction(roleUrls);
Router.onBeforeAction('loading');