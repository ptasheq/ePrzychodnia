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
		UI.insert(UI.renderWithData(Template.patientsSearch, {patients: Users.find(userData)}), $('.container')[1]);

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
		return validatePesel(pesel);
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
	$('.btn').popover({html: true});
};

Template.patientSearch.helpers({
	gender: function () {
		var g = {};
		g[genders.Male] = 'Mężczyzna';
		g[genders.Female] = 'Kobieta';
		g[genders.NotKnown] = 'Nieznana';
		g[genders.NotApplicable] = 'Nie dotyczy';
		return g[this.profile.gender];
	},
	age: function() {
		var birth = new Date(this.profile.birth_date);
		var today = new Date();

		var age = today.getYear() - birth.getYear();

		// we have to check if we are past birthday
		if (today.getMonth() - birth.getMonth() < 0) {
			--age;
		}	
		else if (today.getMonth() === birth.getMonth()
		         && today.getDay() - birth.getDay() < 0) {
			--age;
		}
		return age;

	},
	email: function() {
		return this.emails[0].address;
	}	
});