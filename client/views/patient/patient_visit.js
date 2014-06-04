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
	'submit form': function (e) {
		e.preventDefault();	
		var physician = $(e.target).find('[name=physician]').val();
		if (physician !== '-1') {
			Meteor.call('askVisit', physician, function(error, result) {
				notify(error, result);
			});
		}
	},
	'click td .btn': function(e) {
		e.preventDefault();
		if (confirm('Czy na pewno chcesz odwołać wizytę?')) {
			Meteor.call('cancelVisit', e.currentTarget.id, function(error, result) {
				notify(error, result);
			});
		}
	}
});

Template.patientVisit.helpers({
	physicians: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}});
	},
	visits: function() {
		var query = Visits.find({});
		return query.count() > 0 ? query : false;
	}
});