Template.confirmVisits.rendered = function() {
	var id;
	if ((id = document.URL.substr(document.URL.lastIndexOf('/')+1)) !== "") {
		$('#choosePhysician [value=' + id + ']').attr('selected', 'selected');
	}

	var tmp = $.fn.popover.Constructor.prototype.show;
	$.fn.popover.Constructor.prototype.show = function () {
		tmp.call(this);
		if (this.options.callback) {
			this.options.callback();
		}
	}
	$('.btn-success').popover({
		html: true, 
		content: $('#visitdataWrapper').html(), 
		placement: 'left',
		callback: function() {
			console.log('ok');
			$('.datepicker').datepicker({
				format: "yyyy-mm-dd",
			    todayHighlight: true
			});
			Meteor.typeahead($('.popover [name=reason]')[0]);
			$.validator.addMethod('time', function(time, element) {
				if (validationRules.time(time)) {
					time = time.split(':');
					var el = element.nextSibling;
					var date = new Date();
					while (el && el.name != 'visit-date') {
						el = el.nextSibling;
					}
					if (el.value === date.toISOString().substr(0, 10)) {
						var date2 = new Date();
						date2.setHours(time[0]);
						date2.setMinutes(time[1]);
						return (date2 - date > visitOptions.minTime * 60 * 1000);
					}
					return true;
				}
				return false;
			});
			$.validator.addMethod('futureDate', function(date, element) {
				return validationRules.futureDate(date);
			});
			$(".form-horizontal").validate({
				rules: {
					time: {
						time: true
					},
					'visit-date': {
						dateISO: true,
						futureDate: true
					}
				}
			});
			$.validator.messages.time = 'Proszę wprowadzić prawidłową godzinę';
			$.validator.messages.futureDate = 'Nie można wprowadzić przeszłej daty';
		}
	});

};

Template.confirmVisits.events({
	'click .confirm': function (e) {
		e.preventDefault();

		var t = $(e.target).siblings('[name=time]').val().split(':');
		var d = $(e.target).siblings('[name=visit-date]').val().split('-');
		var id = e.target.parentNode.parentNode.parentNode.previousSibling.id;
		var data = {
			visitId: id,
			date: new Date(d[0], d[1]-1, d[2], t[0], t[1]),
			reason: $(e.target).siblings('.twitter-typeahead').children('[name=reason]').val()
		}

		//@TODO: unique date constraint - we can't have two patients in the same time

		var v = Visits.find(id);
		var patientId = v.collection.findOne().patient;
		var u = Users.find(patientId);
		var patient = u.fetch();
		var phone = patient[0].profile.contact.phone;
		
		var niceDate = data.date.toISOString().substr(0,10) + " " + data.date.getHours() + ":";
		niceDate += data.date.getMinutes() < 10 ? '0' + data.date.getMinutes() : data.date.getMinutes();

		console.log(data);

		Meteor.call('confirmVisit', data, function(error, result) {
			notify(error, result);
		});

		Meteor.call('sendsms', phone, niceDate, function(error, result) {
			notify(error, result);
		}); 
	},
	'click .btn-danger': function(e) {
		e.preventDefault();
		if (confirm('Czy na pewno chcesz odwołać wizytę?')) {
			Meteor.call('cancelVisit', e.currentTarget.id, function(error, result) {
				notify(error, result);
			});
		}
	},
	'change [name=physician]': function(e) {
		if ($(e.currentTarget).find(":selected").val() == '-1') {
			$(e.currentTarget).css('color', '#919191')
			$('button').attr('disabled', 'disabled');
		}
		else {
			$(e.currentTarget).css('color', '#555555')
			$('button').removeAttr('disabled');
		}
	},
	'submit #choosePhysician': function(e) {
		e.preventDefault();
		if ($('#choosePhysician select').val() !== '-1') {
			Router.go('confirmVisits', {_id: $('#choosePhysician select').val()});
		}
	}
});

Template.confirmVisits.helpers({
	patients: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}, roles: [roles.Patient]});
	},
	physicians: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}, roles: [roles.Staff]});
	},
	visits: function() {
		var query = Visits.find({confirmed: false});
		return query.count() > 0 ? query : false;
	},
	physicianSubpage: function() {
		return (document.URL.split('confirmVisits')[1].length > 1);
	}
});

Template.visitsTable.icd10 = function(query, callback) {
	Meteor.call('fetchIcd10', query, function(error, result) {
		callback(result.map(function(i) {return {value: i.code + " " + i.name}}));
	});
};