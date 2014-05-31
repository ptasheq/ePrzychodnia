Meteor.methods({
	fetchIcd9: function (query, limit) {
		if (!query) {
			return [];
		}

		// we can't send too much data to client
		if (parseInt(limit)) {
			limit = Math.min(importedOptions.limit, Math.abs(limit));
		}
		else {
			limit = importedOptions.limit;
		}

		var reBegin = new RegExp('^' + query);
		var re = new RegExp('.*' + query + '.*', 'i');
		return Icd9.find({$or: [{subcategoryTitle: {$regex: re}}, {subcategory: {$regex: reBegin}}]}, {limit: limit}).fetch();
	}
});