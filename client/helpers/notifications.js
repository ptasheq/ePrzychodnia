Notifications = new Meteor.Collection(null);

notify = function(error, message) {
	if (error) {
		message = error.reason;
	}
	if (message) {
		Notifications.insert({message: message, error: !!error});
	}
}

clearNotifications = function() {
	Notifications.remove({seen: true});
}

