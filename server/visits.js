Meteor.publish('visits', function() {
	return Visits.find({patient: this.userId});
});

Meteor.methods({
	askVisit: function (physicianId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['patient'])) {
			throw new Meteor.Error(401, errors.patient);
		}

		if (!physicianId || !Roles.userIsInRole(physicianId, ['staff'])) {
			throw new Meteor.Error(401, errors.chooseDoctor);
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
			throw new Meteor.Error(401, errors.visitExist);
		}

		//@TODO mongo transaction

		var visitId = Visits.insert({
			patient: currentUser._id, 
			physician: physicianId, 
			confirmed: false
		}, function(error, result) {
			if (error) {
				throw new Meteor.Error(401, errors.visitAsk);
			}
		});

		Meteor.users.update({_id: {$in: [currentUser._id, physicianId]}}, {$addToSet: {'profile.visits': visitId}}, {multi: true});
		return true;
	},
	cancelVisit: function(visitId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['patient'])) {
			Meteor.Error(401, errors.patient);
		}

		var visit = Visits.findOne({_id: visitId});

		if (visit.patient !== currentUser._id) {
			Meteor.Error(401, errors.visitModify);
		}

		//@TODO mongo transaction
		Meteor.users.update({_id: {$in: [currentUser._id, visit.physician]}}, {$pull: {'profile.visits': visitId}}, {multi: true});
		Visits.remove({_id: visitId});	
	}
});