Meteor.methods({
	askVisit: function (doctorId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['patient'])) {
			throw new Meteor.Error(401, 'Musisz być pacjentem, aby wykonać tę akcję!');
		}

		if (!doctorId || !Roles.userIsInRole(doctorId, ['staff'])) {
			throw new Meteor.Error(401, 'Musisz wskazać lekarza!');
		}

		// we check if we haven't signed up for an appointment already
		var today = new Date();
		if (Visits.find({patient: currentUser, doctor: doctorId, date: {'$lt': today}}).count() !== 0) {
			throw new Meteor.Error(401, 'Już masz umówioną wizytę z tym lekarzem!');
		}

		Visits.insert({
			patient: currentUser, 
			doctor: doctorId, 
			confirmed: false
		});

	}
});