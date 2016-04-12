/*globals moment */
(function () {
	
	angular.module('teleconference')
		.directive('dateValidator', function() {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function(scope, element, attr, ctrl) {					
					// please note you can name your function & argument anything you like
					function customValidator(ngModelValue) {
						
						var now = moment(),
							value = moment(ngModelValue);
						
						// Check if provided input is an actual valid date time object
						if (value.isValid()) {
							ctrl.$setValidity('isValidDateTime', true);
						} else {
							ctrl.$setValidity('isValidDateTime', false);
						}
						
						if (value.isBefore(now)) {
							ctrl.$setValidity('occurInPast', false);
						} else {
							ctrl.$setValidity('occurInPast', true);
						}
						
						// we need to return our ngModelValue, to be displayed to the user(value of the input)
						return ngModelValue;
					}
					
					ctrl.$parsers.push(customValidator);
				}
			};
		});
})();