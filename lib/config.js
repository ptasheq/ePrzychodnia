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

errors = {};

if (Meteor.isServer) {
	errors = JSON.parse(Assets.getText('errors.json'));
}

Accounts.config({
	sendVerificationEmail: false
});