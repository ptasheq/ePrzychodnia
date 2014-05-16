Errors = new Meteor.Collection(null);

throwError = function(message) {
	Errors.insert({message: message});
}

clearErrors = function() {
	Errors.remove({seen: true});
}