validatePesel = function(pesel) {
	if (pesel.length != 11 || !parseInt(pesel))
		return false;

	var controlVal = parseInt(pesel[0]) + 3 * parseInt(pesel[1]) + 7 * parseInt(pesel[2]) + 9 * parseInt(pesel[3])
				   + parseInt(pesel[4]) + 3 * parseInt(pesel[5]) + 7 * parseInt(pesel[6]) + 9 * parseInt(pesel[7])
				   + parseInt(pesel[8]) + 3 * parseInt(pesel[9]) + parseInt(pesel[10]);
	return !(controlVal % 10);
}

validateBirthDate = function(date) {
	date = new Date(date);
	return !!date && (new Date() - date) > 0;
}