roles = Object.freeze({
	Admin: 'admin',
	Patient: 'patient',
	Staff: 'staff'
});

Accounts.config({
	sendVerificationEmail: false
});