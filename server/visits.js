Meteor.publish('visits', function(args) {
	if (Roles.userIsInRole(this.userId, [roles.Patient])) {
		return Visits.find({patient: this.userId});
	}
	if (!args) {
		return [];
	}
	if (Roles.userIsInRole(this.userId, [roles.Office, roles.Staff])) {
		if (args.confirmed)
			return Visits.find({confirmed: true, $or: [{patient: args.id}, {physician: args.id}]}, {$sort: {date: -1}});
		return Visits.find({confirmed: false, $or: [{patient: args.id}, {physician: args.id}]});
	}
});

Meteor.publish('singleVisit', function(id) {
	if (Roles.userIsInRole(this.userId, [roles.Office])) {
		return Visits.find({_id: id});
	}
	return Visits.find({_id: id, physician: this.userId});
});

Meteor.methods({
	askVisit: function (physicianId) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Patient])) {
			throw new Meteor.Error(401, errors.patient);
		}

		if (!physicianId || !Roles.userIsInRole(physicianId, [roles.Staff])) {
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
			confirmed: false,
			smssent: false
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

		if (!currentUser) {
			throw new Meteor.Error(401, errors.privileges);
		}

		if (Roles.userIsInRole(currentUser, [roles.Patient]) && !_.contains(currentUser.profile.visits, visitId)) {
			throw new Meteor.Error(401, errors.visitOwnModify);
		}
		
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Patient, roles.Office, roles.Staff])) {
			throw new Meteor.Error(401, errors.privileges);
		}

		visit = Visits.findOne({_id: visitId});

		//@TODO mongo transaction
		Meteor.users.update({_id: {$in: [visit.patient, visit.physician]}}, {$pull: {'profile.visits': visitId}}, {multi: true});
		Visits.remove({_id: visitId});	
		return false;
	},
	confirmVisit: function(data) {
		var currentUser = Meteor.user();
		if (!currentUser || !Roles.userIsInRole(currentUser, [roles.Staff, roles.Office]) || (Roles.userIsInRole(currentUser, [roles.Staff]) 
		    && data.visitId && !_.contains(currentUser.profile.visits, data.visitId))) {
			throw new Meteor.Error(401, errors.privileges);
		}
		if (!data.date.valueOf() || (data.date - new Date() <= visitOptions.minTime * 60 * 1000)) {
			throw new Meteor.Error(401, errors.wrongData);
		}
		// adding new visit
		if (!data.visitId) {
			var visitId = Visits.insert({confirmed: true, date: data.date, reason: data.reason});
			Meteor.users.update({_id: {$in: [this.userId, data.patientId]}}, {$addToSet: {'profile.visits': visitId}}, {multi: true});
			return successes.addVisit;	
		}
		Visits.update({_id: data.visitId, confirmed: false}, {$set: {confirmed: true, date: data.date, reason: data.reason}}, function(error, result) {
			if (error) {
				throw new Meteor.Error(401, errors.visitModify);
			}
		});
		return false;
	}
});
