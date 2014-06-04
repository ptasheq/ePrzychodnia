Meteor.setInterval( function(){
	console.log("setInterval()");
	var v = Visits.find({confirmed: true, smssent: false});
	v.forEach(function(visit){
		console.log("forEach()");
		var visitDate = new Date(visit.date);
		var todayDate = new Date();
		var oneDay = 24*60*60*1000;

		if(visitDate - todayDate < oneDay)
		{
			var u = Users.find(id=visit.patient);
			var patient = u.fetch();
			var phone = patient[0].profile.contact.phone;

			var key = 'c61d983a';
            		var secret = 'd1b83f52';
	    		var nexmo = Meteor.require('easynexmo');
			var niceDate = visit.date.toISOString().substr(0,10) + " " + visit.date.getHours() + ":" + visit.date.getMinutes();

			//nexmo.initialize(key, secret);
	    		//nexmo.sendTextMessage('NEXMO', phone, "Przypominamy o wizycie w terminie " + niceDate );
			Visits.update({_id: visit._id}, {$set: {smssent: true}}, function(error, result){
					if (error) {
						throw new Meteor.Error(401, errors.visitModify);
					}
			}); 
		}
	});
}, 60*60*1000);
