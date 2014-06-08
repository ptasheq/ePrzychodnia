var events = {
	'submit form': function (e) {
		e.preventDefault();

		var id = $(e.target).find('[name=id]').val();
		var pesel = $(e.target).find('[name=pesel]').val();
		var lastname = $(e.target).find('[name=lastname]').val();
		var date = $(e.target).find('[name=age]').val() ? new Date(new Date().setYear(new Date().getFullYear() - (parseInt($(e.target).find('[name=age]').val())+1))) : null;
		var dateNextYear = date ? new Date(new Date().setYear(date.getFullYear() + 1)) : null;
		var userData = {_id: id, username: pesel, 'profile.lastname': lastname,
						'profile.birth_date': {'$gt': date.toISOString().substr(0,10), '$lte': dateNextYear.toISOString().substr(0,10)}};
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
		return validationRules.pesel(pesel) 
		|| ($('[name=id]').val() !== '' && $('[name=pesel]').val() === '');
	});

	$.validator.addMethod('age', function(age, element) {
		return parseInt(age) && age > 0 && age < 121;
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
};

Template.showPatient.events(events);

Template.patientSearch.rendered = function () {
	$('.extend').popover({html: true});
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
	'click a.confirm': function(e) {
		e.preventDefault();
		if (confirm('Czy na pewno chcesz zatwierdzić dane tego pacjenta?')) {
			var id = e.currentTarget.parentNode.parentNode.children[0].textContent;
			Meteor.call('confirmUser', id, function(error, result) {
				notify(error, result);
			});
		}
	}
});