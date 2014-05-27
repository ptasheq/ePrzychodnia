Template.patientVisit.rendered = function () {
	$('[name=physician]').change(function() {
		if ($(this).find(":selected").val() == '-1') {
			$(this).css('color', '#919191')
			$('button').attr('disabled', 'disabled');
		}
		else {
			$(this).css('color', '#555555')
			$('button').removeAttr('disabled');
		}
	}); 
};

Template.patientVisit.events({
	'submit form': function () {
		
	}
});

Template.patientVisit.helpers({
	physicians: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}});
	}
});