var events = {
	'submit form': function (e) {
		e.preventDefault();

		var id = $(e.target).find('[name=id]').val();
		var pesel = $(e.target).find('[name=pesel]').val();
		var userData = {_id: id, username: pesel, roles: [roles.Patient]};
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

	// A workaround that allows us to submit an invalidate form
	$('#showPatient').validate({
		invalidHandler: function(event, validator) {
			events['submit form'](event);
		},
		onSubmit: false,
		rules: {
			pesel: {pesel: true}
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
	}	
});