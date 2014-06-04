roles = Object.freeze({
	Admin: 'admin',
	Patient: 'patient',
	Staff: 'staff',
	Office: 'office'
});

genders = Object.freeze({
	Male: 1,
	Female: 2,
	NotKnown: 0,
	NotApplicable: 9
});

visitOptions = Object.freeze({
	openHour: 8,
	closeHour: 17,
	// min time in minutes after we can set up visit
	minTime: 30
});

importedOptions = Object.freeze({
	limit: 10 
});

errors = {};
successes = {};

if (Meteor.isServer) {
	errors = JSON.parse(Assets.getText('errors.json'));
	successes = JSON.parse(Assets.getText('successes.json'));
}

Accounts.config({
	sendVerificationEmail: false
});