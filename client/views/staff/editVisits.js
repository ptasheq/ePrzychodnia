Template.editVisits.rendered = function () {
	Meteor.typeahead($('[name=icd9]')[0]);
};

Template.editVisits.icd9 = function(query, callback) {
	Meteor.call('fetchIcd9', query, function(error, result) {
		if (error) {
			throwError(error);
		}
		callback(result.map(function(i) {return {value: i.subcategory + " " + i.subcategoryTitle}}));
	});
};