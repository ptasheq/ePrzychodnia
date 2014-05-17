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

	this.route('staffIndex', {
		path: '/staff',
		data: function() {	
			return {
			}
		}
	});
});

Router.onBeforeAction(function() {clearErrors()});