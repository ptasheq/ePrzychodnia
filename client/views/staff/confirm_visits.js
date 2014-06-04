Template.confirmVisits.rendered = function () {

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
	var tmp = $.fn.popover.Constructor.prototype.show;
	$.fn.popover.Constructor.prototype.show = function () {
		tmp.call(this);
		if (this.options.callback) {
			this.options.callback();
		}
	}
	$('.btn-success').popover({
		html: true, 
		content: $('#datepickerWrapper').html(), 
		placement: 'left',
		callback: function() {
			$('.datepicker').datepicker({
				format: "yyyy-mm-dd",
			    todayHighlight: true
			});
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
			date: new Date(d[0], d[1]-1, d[2], t[0], t[1])
		}

		//@TODO: unique date constraint - we can't have two patients in the same time

		var v = Visits.find(id=id);
		var patientId = v.collection.findOne().patient;
		var u = Users.find(id=patientId);
		var patient = u.fetch();
		var phone = patient[0].profile.contact.phone;
		
		var niceDate = date.toISOString().substr(0,10) + " " + date.getHours() + ":" + date.getMinutes();

		Meteor.call('sendsms', phone, niceDate, function(error, result) {
			if (error) {
				throwError(error.reason);
			}
		}); 

		Meteor.call('confirmVisit', data, function(error, result) {
			if (error) {
				throwError(error.reason);
			}
		});
		
	}
});


Template.confirmVisits.helpers({
	patients: function () {
		var userId = Meteor.userId();
		return Users.find({_id: {$ne: Meteor.userId()}});
	},
	visits: function() {
		var query = Visits.find({confirmed: false});
		return query.count() > 0 ? query : false;
	}
});
