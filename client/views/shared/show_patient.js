var events = {
	'submit form': function (e) {
		e.preventDefault();

		var id = $(e.target).find('[name=id]').val();
		var pesel = $(e.target).find('[name=pesel]').val();
		var lastname = $(e.target).find('[name=lastname]').val();
		var date = $(e.target).find('[name=age]').val() ? new Date(new Date().setYear(new Date().getFullYear() - (parseInt($(e.target).find('[name=age]').val())+1))) : null;
		var dateNextYear = date ? new Date(new Date().setYear(date.getFullYear() + 1)) : null;
		var userData = {_id: id, username: pesel, 'profile.lastname': lastname};
		if (date) {
			userData['profile.birth_date'] = {'$gt': date.toISOString().substr(0,10), '$lte': dateNextYear.toISOString().substr(0,10)};
		}	
		for (var i in userData) {
			if (!userData[i])
				delete userData[i];
		}
		UI.insert(UI.renderWithData(Template.patientsSearch, {patients: Users.find(userData)}), $('.patientsSearch')[0]);
	},
	'keyup form': function(e) {
		var inputs = $('.form-horizontal input');
		for (var i = 0; i < inputs.length; ++i) {
			if (inputs[i].value) {
				$('[type=submit]').removeAttr('disabled');
				return;
			}
		}
		$('[type=submit]').attr('disabled', 'disabled');
	}
};

Template.showPatient.rendered = function () {

	$.validator.addMethod('pesel', function(pesel, element) {
		// we want avoid appearing error message when id is correct
		return validationRules.pesel(pesel) || $('[name=pesel]').val() === '';
	});

	$.validator.addMethod('age', function(age, element) {
		return validationRules.age(age) || $('[name=age]').val() === '';
	});

	// A workaround that allows us to submit an invalidate form
	$('#showPatient').validate({
		invalidHandler: function(event, validator) {
			events['submit form'](event);
		},
		onSubmit: false,
		rules: {
			pesel: {pesel: true},
			age: {age: true}
		}
	});
	$.validator.messages.pesel = 'PESEL jest niepoprawny';
	$.validator.messages.age = 'Proszę podać poprawny wiek';
};

Template.showPatient.events(events);

Template.patientSearch.rendered = function () {
	var tmp = $.fn.popover.Constructor.prototype.show;
	$.fn.popover.Constructor.prototype.show = function () {
		tmp.call(this);
		if (this.options.callback) {
			this.options.callback();
		}
	}

	$('.extend').popover({html: true});
	$('.visit').popover({
		html: true, 
		content: $('#visitdataWrapper').html(), 
		placement: 'left',
		callback: function() {
			$('.datepicker').datepicker({
				format: "yyyy-mm-dd",
			    todayHighlight: true
			});
			if (!UI.DomRange.getContainingComponent($('.popover [name=reason]')[0]).icd10) {
				UI.DomRange.getContainingComponent($('.popover [name=reason]')[0]).icd10 = function(query, callback) {
					Meteor.call('fetchIcd10', query, function(error, result) {
						callback(result.map(function(i) {return {value: i.code + " " + i.name}}));
					});
				};
			}
			$('button.confirm').click(function(e) {
				e.preventDefault();
				var id = $(e.target).closest('div.btn-group').children('a')[2].id;
				var t = $(e.target).siblings('[name=time]').val().split(':');
				var d = $(e.target).siblings('[name=visit-date]').val().split('-');
				var data = {
					patientId: id,
					date: new Date(d[0], d[1]-1, d[2], t[0], t[1]),
					reason: $(e.target).siblings('.twitter-typeahead').children('[name=reason]').val()
				}

				//@TODO: unique date constraint - we can't have two patients in the same time

				var phone = Users.find(id).fetch()[0].profile.contact.phone;

				var niceDate = data.date.toISOString().substr(0,10) + " " + data.date.getHours() + ":";
				niceDate += data.date.getMinutes() < 10 ? '0' + data.date.getMinutes() : data.date.getMinutes();

				Meteor.call('confirmVisit', data, function(error, result) {
					notify(error, result);
				});

				Meteor.call('sendsms', phone, niceDate, function(error, result) {
					notify(error, result);
				});
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

Template.patientSearch.helpers({
	email: function() {
		return this.emails[0].address;
	},
	notconfirmed: function() {
		return Roles.userIsInRole(this._id, [roles.PatientTobe]) ? 'notconfirmed': null;
	}	
});

Template.patientSearch.events({
	'click a.confirm-visit': function(e) {
		e.preventDefault();
		if (confirm('Czy na pewno chcesz zatwierdzić dane tego pacjenta?')) {
			Meteor.call('confirmUser', this._id, function(error, result) {
				notify(error, result);
			});
		}
	},

});