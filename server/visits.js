Meteor.publish('visits', function(id) {
	if (id && Roles.userIsInRole(id, roles.Patient)) {
		return Visits.find({patient: id, physician: this.userId, confirmed: true}, {sort: {date: -1}});
	}
	return Visits.find({$or: [{patient: this.userId}, {physician: this.userId}]});
});

Meteor.publish('singleVisit', function(id) {
	return Visits.find({_id: id, physician: this.userId});
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
		//@TODO findAndModify

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
		return false;
	},
	cancelVisit: function(visitId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['patient'])) {
			throw new Meteor.Error(401, errors.patient);
		}

		if (!_.contains(currentUser.profile.visits, visitId)) {
			throw new Meteor.Error(401, errors.visitOwnModify);
		}

		//@TODO mongo transaction
		Meteor.users.update({_id: {$in: [currentUser._id, visit.physician]}}, {$pull: {'profile.visits': visitId}}, {multi: true});
		Visits.remove({_id: visitId});	
	},
	confirmVisit: function(data) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, ['staff']) 
		    || !_.contains(currentUser.profile.visits, data.visitId)) {
			throw new Meteor.Error(401, errors.privileges);
		}

		// visit must take place at least after minTime minutes
		if (!data.valueOf() || (data - new Date() <= visitOptions.minTime * 60 * 1000)) {
			throw new Meteor.Error(401, errors.wrongData);
		}

		Visits.update({_id: data.visitId, confirmed: false}, {$set: {confirmed: true, date: data.date}}, function(error, result) {
			if (error) {
				throw new Meteor.Error(401, errors.visitModify);
			}
		});
		return false;
	}
});