Meteor.publish('visits', function() {
	return Visits.find({patient: this.userId});
});

Meteor.methods({
	askVisit: function (physicianId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['patient'])) {
			throw new Meteor.Error(401, 'Musisz być pacjentem, aby wykonać tę akcję!');
		}

		if (!physicianId || !Roles.userIsInRole(physicianId, ['staff'])) {
			throw new Meteor.Error(401, 'Musisz wskazać lekarza!');
		}

		// we check if we haven't signed up for an appointment already
		var today = new Date();
		var query = {
			$and: [
				{patient: currentUser._id},
				{physician: physicianId},
				{$or: [{date: {$gte: today}}, {date: null}]}
			]
		};
		
		if (Visits.find(query).count() > 0) {
			throw new Meteor.Error(401, 'Już masz umówioną wizytę z tym lekarzem!');
		}

		//@TODO mongo transaction

		var visitId = Visits.insert({
			patient: currentUser._id, 
			physician: physicianId, 
			confirmed: false
		}, function(error, result) {
			if (error) {
				throw new Meteor.Error(401, 'Wystąpił błąd przy próbie zgłoszenia wizyty!');
			}
		});

		Meteor.users.update({_id: {$in: [currentUser._id, physicianId]}}, {$addToSet: {'profile.visits': visitId}}, {multi: true});
		return true;
	}
});