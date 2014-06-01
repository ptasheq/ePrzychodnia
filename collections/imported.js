Icd9 = new Meteor.Collection('icd9');
Icd10 = new Meteor.Collection('icd10');
Meds = new Meteor.Collection('meds');

var denyOptions = {
	insert: function (userId, doc) {
		return true;
	},
	update: function (userId, doc, fields, modifier) {
		return true;
	},
	remove: function (userId, doc) {
		return true;
	}
}

Icd9.deny(denyOptions);
Icd10.deny(denyOptions);
Meds.deny(denyOptions);