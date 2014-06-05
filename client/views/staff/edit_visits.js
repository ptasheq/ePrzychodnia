var firstAdd = {
	icd9: function() {
		$('.highlight').append('<p id="icd9"><strong>Przeprowadzone zabiegi medyczne</strong><br></p>');
	},
	icd10: function() {
		$('.highlight').append('<p id="icd10"><strong>Rozpoznanie</strong><br></p>');
	},
	meds: function() {
		$('.highlight').append('<p id="meds"><strong>Zapisane leki</strong><br></p>');
	},
	visitInfo: function() {
		$('.highlight').append('<p id="visitInfo"><strong>Dodatkowe informacje</strong><br></p>');
	}
}

Template.editVisits.rendered = function () {
	Meteor.typeahead($('[name=icd9]')[0]);
	Meteor.typeahead($('[name=icd10]')[0]);
	Meteor.typeahead($('[name=meds]')[0]);
};

Template.editVisits.events({
	'click .btn-default': function(e) {
		e.preventDefault();
		var input = $(e.currentTarget).parent().siblings().find('.form-control')[0];

		var dose = '';
		// additional info about dose have to be provided
		if (input.name === 'meds') {
			if ($('[name=meds-dose]').val().length < 6) {
				$('[name=meds-dose]').parent().addClass('has-error');
				$('[name=meds-dose]').focus();
				return;
			}
			dose = ' - ' +  $('[name=meds-dose]').val();
		} 

		if ($('#' + input.name).length === 0) {
			firstAdd[input.name]();
		}
		var duplicate = false;
		_.each($('#' + input.name).children('span'), function(el) {if (!duplicate) duplicate = el.innerHTML.indexOf(input.value) > -1;});
		if (duplicate) {
			notify({reason: 'Nie możesz dodać 2 razy tego samego zabiegu!'});
		}
		else {
			$('#' + input.name).append('<span>' + input.value + dose + '<a href="#" class="remove"><span class="glyphicon glyphicon-remove"></span></a><br></span>');
			e.currentTarget.disabled = 'disabled';
		}
		input.value = '';
	},

	'click .remove': function(e) {
		e.preventDefault();
		if ($(e.currentTarget.parentNode).siblings('span').length === 0) {
			$(e.currentTarget.parentNode.parentNode).remove();
		}
		else {
			$(e.currentTarget.parentNode).remove();
		}
	},
	'keyup .form-control': function(e) {
		if (!e.currentTarget.value) {
			$(e.currentTarget).parent().siblings().find('.btn').attr('disabled', 'disabled');
		}
		else {
			$(e.currentTarget).parent().siblings().find('.btn').removeAttr('disabled');
		}
	},
	'click #confirm': function(e) {
		e.preventDefault();

		// we can't modify if visit hasn't taken place yet
		if (new Date() < Visits.findOne().date && !confirm('Wizyta jeszcze się nie zaczęła. Czy mimo to chcesz ją uzupełnić?')) {
			return;
		}

		var query = {
			icd9: [],
			icd10: [],
			meds: [],
			'visitInfo': [],
		};	

		// filling query with data
		_.each(query, function(value, key) {
			var el = document.getElementById(key);
			var nodeSet = el ? _.intersection(el.getElementsByTagName('span'), el.children) : [];
			_.each(nodeSet, function(node) {
				value.push(node.textContent);
			});
		});

		Meteor.call('editVisit', query, document.URL.replace(/.*\//g, ''), function(error, result) {
			notify(error, result);	
		});

	}

});

Template.editVisits.icd9 = function(query, callback) {
	Meteor.call('fetchIcd9', query, function(error, result) {
		callback(result.map(function(i) {return {value: i.subcategory + " " + i.subcategoryTitle}}));
	});
};

Template.editVisits.icd10 = function(query, callback) {
	Meteor.call('fetchIcd10', query, function(error, result) {
		callback(result.map(function(i) {return {value: i.code + " " + i.name}}));
	});
};

Template.editVisits.meds = function(query, callback) {
	Meteor.call('fetchMeds', query, function(error, result) {
		var resultToDisplay = [];
		_.each(result, function(item) {
			_.each(item.content.split('\n'), function(subitem) {
				resultToDisplay.push(item.ingredients + ' | ' + item.name + (subitem ? ' | ' + subitem : ''));
			});
		});
		callback(resultToDisplay.map(function(i) {return {value: i}}));
	});
};

Template.editVisits.getData = function(data) {
	// a workaround to avoid getting same data from client and server - we add if it isn't already on site
	var values = _.values($('.highlight p[id]>span:not(.fromserver)').map(function(key, value) {return value.textContent}));
	return (!values && data) ? true : _.difference(data, values);
}