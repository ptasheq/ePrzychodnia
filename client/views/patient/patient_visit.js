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
				if (error) {
					throwError(error.reason);
				}
			});
		}
	},
	'click td .btn': function(e) {
		e.preventDefault();
		//alert($(this).val());
		if (confirm('Czy na pewno chcesz odwołać wizytę?')) {
			Meteor.call('cancelVisit', e.currentTarget.id, function(error, result) {
				if (error) {
					throwError(error.reason);
				}
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
		var userId = Meteor.userId();
		return Visits.find({});
	}
});

Template.patientVisits.helpers({
	 physicianData: function (id) {
	 	return Users.findOne({_id: id});
	}
});