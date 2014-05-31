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

UI.registerHelper('gender', function () {
	var g = {};
	g[genders.Male] = 'Mężczyzna';
	g[genders.Female] = 'Kobieta';
	g[genders.NotKnown] = 'Nieznana';
	g[genders.NotApplicable] = 'Nie dotyczy';
	return g[this.profile.gender];
});

UI.registerHelper('formattedDate', function() {
	// if is required to prevent errors with deps
	if (this.date) {
		return this.date.toISOString().substr(0, 10) + ' o godzinie: ' + this.date.getHours() + ':' + this.date.getMinutes();  
	}
});

UI.registerHelper('age', function() {
	var birth = new Date(this.profile.birth_date);
	var today = new Date();

	var age = today.getYear() - birth.getYear();

	// we have to check if we are past birthday
	if (today.getMonth() - birth.getMonth() < 0) {
		--age;
	}	
	else if (today.getMonth() === birth.getMonth()
	         && today.getDay() - birth.getDay() < 0) {
		--age;
	}
	return age;

});

UI.registerHelper('userData', function (id) {
 	return Users.findOne({_id: id});
});