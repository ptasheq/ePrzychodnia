Template.viewVisits.rendered = function () {

	var id;
	if ((id = document.URL.substr(document.URL.lastIndexOf('/')+1)) !== "") {
		$('#choosePhysician [value=' + id + ']').attr('selected', 'selected');
	}

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

	var initDate = [new Date(), new Date()];
	initDate[0].setHours(0);
	initDate[1].setHours(23);
	var query = Visits.find({physician: Meteor.userId(), confirmed: true, date: {$gte: initDate[0], $lt: initDate[1]}});
	var template = UI.renderWithData(Template.viewVisitsResults, {visits: query, visitsCount: query.count()});
	$('.datepicker-container').datepicker({todayHighlight: true});
	var tmp = new Date();
	tmp.setHours(0);
	tmp.setMinutes(0);
	$('.datepicker-container').datepicker('setDate',tmp); 
	UI.insert(template, $('.viewVisitsResults')[0]);
};

Template.viewVisits.events({
	'changeDate .datepicker-container': function(e) {
		var chosenDate = [$('.datepicker-container').datepicker('getDate'), $('.datepicker-container').datepicker('getDate')];
		chosenDate[1].setHours(23);
		// we display either our visits or if we are the office the ones we asked for
		var query = Visits.find({physician: (this._id) ? this._id : Meteor.userId(), confirmed: true, date: {$gte: chosenDate[0], $lt: chosenDate[1]}});
		var template = UI.renderWithData(Template.viewVisitsResults, {visits: query, visitsCount: query.count()});
		$('.viewVisitsResults').empty();
		UI.insert(template, $('.viewVisitsResults')[0]);
	},
	'submit #choosePhysician': function(e) {
		e.preventDefault();
		if ($('#choosePhysician select').val() != '-1') {
			Router.go('viewVisits', {_id: $('#choosePhysician select').val()});
		}
	}
});

Template.viewVisitsResults.helpers({
	time: function () {
		return this.date.getHours() + ':' + (this.date.getMinutes() < 10 ? '0' + this.date.getMinutes() : this.date.getMinutes()); 
	}
});

Template.viewVisits.helpers({
	physicians: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}, roles: [roles.Staff]});
	}
});