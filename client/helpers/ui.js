UI.registerHelper('siteReady', function() {
	// we need this to prevent user from seeing header blinking
	return Accounts.loginServicesConfigured();
});

UI.registerHelper('getRoles', function() {
	return roles;
});

UI.registerHelper('routeIs', function(routeName) {
	return Router.current().route.name === routeName ? 'active' : '';
});