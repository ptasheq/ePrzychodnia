Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function() {
	this.route('patientIndex', {
		path: '/',
		data: function() {
			return {
				isPatientSite: true
			}
		}
	});

	this.route('adminIndex', {
		path: '/admin',
		data: function() {
			return {
				isAdminSite: true
			}
		}
	});
	this.route('staffIndex', {
		path: '/staff',
		data: function() {	
			return {
				isStaffSite: true
			}
		}
	});
});