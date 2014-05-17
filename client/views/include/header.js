Template.header.helpers({
	// we need this to prevent user from seeing header blinking
	siteReady: function() {
		return Accounts.loginServicesConfigured();
	},
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
