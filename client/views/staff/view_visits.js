Template.viewVisits.rendered = function () {
	var initDate = [new Date(), new Date()];
	initDate[0].setHours(0);
	initDate[1].setHours(23);
	var query = Visits.find({physician: Meteor.userId(), confirmed: true, date: {$gte: initDate[0], $lt: initDate[1]}});
	var template = UI.renderWithData(Template.viewVisitsResults, {visits: query, visitsCount: query.count()});
	$('.datepicker').datepicker({todayHighlight: true});
	UI.insert(template, $('.viewVisitsResults')[0]);
};

Template.viewVisits.events({
	'changeDate .datepicker': function (e) {
		var chosenDate = [$('.datepicker').datepicker('getDate'), $('.datepicker').datepicker('getDate')];
		chosenDate[1].setHours(23);
		var query = Visits.find({physician: Meteor.userId(), confirmed: true, date: {$gte: chosenDate[0], $lt: chosenDate[1]}});
		var template = UI.renderWithData(Template.viewVisitsResults, {visits: query, visitsCount: query.count()});
		$('.viewVisitsResults').empty();
		UI.insert(template, $('.viewVisitsResults')[0]);
	}
});

Template.viewVisitsResults.helpers({
	time: function () {
		return this.date.getHours() + ':' + this.date.getMinutes(); 
	}
});

Template.viewVisitsResults.events({
});