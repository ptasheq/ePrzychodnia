roles = Object.freeze({
	Admin: 'admin',
	Patient: 'patient',
	Staff: 'staff'
});

genders = Object.freeze({
	Male: 1,
	Female: 2,
	NotKnown: 0,
	NotApplicable: 9
});

Accounts.config({
	sendVerificationEmail: false
});