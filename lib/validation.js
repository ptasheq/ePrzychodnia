validationRules = {
	age: function(data) {
		return parseInt(data) > 0 && data < 121;
	},
	firstname: function(data) {
		return data.length > 1;
	},
	lastname: function(data) {
		return data.length > 1;
	},
	email: function(data) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(data);
	},
	profession: function(data) {
		return data.length > 0;
	},
	pesel: function(pesel) {
		if (pesel.length != 11 || !parseInt(pesel))
			return false;

		var controlVal = parseInt(pesel[0]) + 3 * parseInt(pesel[1]) + 7 * parseInt(pesel[2]) + 9 * parseInt(pesel[3])
					   + parseInt(pesel[4]) + 3 * parseInt(pesel[5]) + 7 * parseInt(pesel[6]) + 9 * parseInt(pesel[7])
					   + parseInt(pesel[8]) + 3 * parseInt(pesel[9]) + parseInt(pesel[10]);
		return !(controlVal % 10);
	},
	birthDate : function(date) {
		date = new Date(date);
		return !!date && (new Date() - date) > 0;
	},
	futureDate: function(date) {
		date = new Date(date);
		today = new Date(new Date().toDateString());
		return date.valueOf() && (today - date) <= 0;
	},
	time: function(time) {
		time = time.split(':');
		return time.length == 2 && time[0] >= visitOptions.openHour 
			   && time[0] < visitOptions.closeHour && time[1].length == 2 && time[1] >= 0 && time[1] < 60;
	},
	phone: function(phone) {
		phone.replace('/-/g', '');
		re = /^(\+48)?[0-9]{9}$/;
		return re.test(phone) || phone === '';
	}
};

validationRules['emails.0.address'] = validationRules.email;