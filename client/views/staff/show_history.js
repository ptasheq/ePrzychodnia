Template.showHistory.events({
	'click .btn.pull-right': function (e) {
		e.preventDefault();
		if ($(e.currentTarget).children('.glyphicon').hasClass('glyphicon-plus')) {
			$(e.currentTarget).children('.glyphicon').removeClass('glyphicon-plus');
			$(e.currentTarget).children('.glyphicon').addClass('glyphicon-minus');
		}
		else if ($(e.currentTarget).children('.glyphicon').hasClass('glyphicon-minus')) {
			$(e.currentTarget).children('.glyphicon').removeClass('glyphicon-minus');
			$(e.currentTarget).children('.glyphicon').addClass('glyphicon-plus');
		}
		$(e.currentTarget).parents('.panel').children('.panel-body').slideToggle('medium');
	}
});

Template.showHistory.visits = function() {
	return Visits.find();
}

Template.showHistory.getData = function(data) {
	return (data && data.length > 0) ? data : null;
}