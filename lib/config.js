successes = Object.freeze({
	addPatient: "Pacjent został pomyślnie dodany do bazy danych",
	addStaff: "Lekarz został pomyślnie dodany do bazy danych",
	editVisit: "Pomyślnie zmieniono dane dotyczące wizyty",
	editUser: "Pomyślnie zmieniono dane dotyczące użytkownika",
	deleteUser: "Pomyślnie usunięto użytkownika z bazy danych"
});

errors = Object.freeze({
	login: "Musisz być zalogowanym, aby skorzystać z tej funkcji!",
	wrongLogin: "Podane błędne dane dotyczące logowania!",
	wrongData: "Serwer otrzymał nieprawidłowe dane!",
	admin: "Aby wykonać tę akcję musisz mieć uprawnienia administratora!",
	patient: "Musisz być pacjentem, aby wykonać tę akcję!",
	privileges: "Aby wykonać tę akcję musisz mieć odpowiednie uprawnienia!",
	incorrectForm: "Formularz zawiera nieprawidłowe dane!",
	createUser: "Wystąpił błąd podczas tworzenia użytkownika. Być może podany email jest już w użyciu.",
	modifyUser: "Modyfikacja danych użytkownika nie powiodła się!",
	userNotExist: "Podany użytkownik nie istnieje!",
	chooseDoctor: "Musisz wskazać lekarza!",
	visitExist: "Już masz umówioną wizytę z tym lekarzem!",
	visitOwnModify: "Musisz wybrać własną wizytę do modyfikacji!",
	visitModify: "Wystąpił błąd przy próbie modyfikacji danych wizyty!",
	visitAsk: "Wystąpił błąd przy próbie zgłoszenia wizyty!" 
});

roles = Object.freeze({
	Admin: 'admin',
	Patient: 'patient',
	PatientTobe: 'patienttobe',
	AnyPatient: 'patient,patienttobe',
	Staff: 'staff',
	Office: 'office'
});

genders = Object.freeze({
	Male: 1,
	Female: 2,
	NotKnown: 0,
	NotApplicable: 9
});

visitOptions = Object.freeze({
	openHour: 8,
	closeHour: 17,
	// min time in minutes after we can set up visit
	minTime: 30
});

importedOptions = Object.freeze({
	limit: 10 
});

Accounts.config({
	sendVerificationEmail: false
});