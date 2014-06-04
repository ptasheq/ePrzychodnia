var validateVisitData = {
	icd9: function(item) {
		var fields = item.split(/ (.+)/);
		return fields.length > 1 && Icd9.find({subcategoryTitle: fields[1], subcategory: fields[0]}).count();
	},
	icd10: function(item) {
		var fields = item.split(/ (.+)/);
		return fields.length > 1 && Icd10.find({name: fields[1], code: fields[0]}).count();
	},
	meds: function(item) {
		var fields = item.split(' | ');
		return fields.length > 1 && Meds.find({ingredients: fields[0], name: fields[1]}).count();
	},
	visitInfo: function(item) {
		return item.length > 0;
	}	
}

Meteor.methods({
	fetchIcd9: function (query, limit) {
		if (!query) {
			return [];
		}

		// we can't send too much data to client
		limit = (parseInt(limit)) ? Math.min(importedOptions.limit, Math.abs(limit)) : importedOptions.limit;

		var reBegin = new RegExp('^' + query);
		var re = new RegExp('.*' + query + '.*', 'i');
		return Icd9.find({$or: [{subcategoryTitle: {$regex: re}}, {subcategory: {$regex: reBegin}}]}, {limit: limit}).fetch();
	},
	fetchIcd10: function(query, limit) {
		if (!query) {
			return [];
		}

		limit = (parseInt(limit)) ? Math.min(importedOptions.limit, Math.abs(limit)) : importedOptions.limit;

		var reBegin = new RegExp('^' + query);
		var re = new RegExp('.*' + query + '.*', 'i');
		return Icd10.find({$or: [{name: {$regex: re}}, {code: {$regex: reBegin}}]}, {limit: limit}).fetch();
	},
	fetchMeds: function(query, limit) {
		if (!query) {
			return [];
		}

		limit = (parseInt(limit)) ? Math.min(importedOptions.limit, Math.abs(limit)) : importedOptions.limit;

		var re = new RegExp('.*' + query + '.*', 'i');
		return Meds.find({$or: [{ingredients: {$regex: re}}, {name: {$regex: re}}]}, {limit: limit}).fetch();
	},

	editVisit: function(query, visitId) {
		var currentUser = Meteor.user();
		if (!query || !visitId || _.without(_.keys(query), 'icd9', 'icd10', 'meds', 'visitInfo').length > 0) {
			throw new Meteor.Error(401, errors.wrongData);
		}

		if (!Roles.userIsInRole(currentUser, [roles.Office, roles.Staff])) {
			throw new Meteor.Error(401, errors.privileges);
		}

		for (var key in query) {
			for (var i = 0; i < query[key].length; ++i) {
				if (!validateVisitData[key](query[key][i])) {
					throw new Meteor.Error(401, errors.wrongData);
				}
			}
		}

		Visits.update({_id: visitId, physician: currentUser._id}, {$set: {data: query}});
		return successes.editVisit;
	},

	sendsms: function(phone, date) {
            var key = 'c61d983a';
            var secret = 'd1b83f52';
	    var nexmo = Meteor.require('easynexmo');
	    //nexmo.initialize(key, secret);
	    //nexmo.sendTextMessage('NEXMO', phone, "Lekarz potwierdzil przyjecie na wizyte w terminie " + date );
            console.log("log sms phone: " + phone);
 
    	}

});
