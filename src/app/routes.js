(function() {
	'use strict';

	angular
		.module('teleconference')
		.config(routeConfig);

	function routeConfig($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'app/main/main.html',
			controller: 'MainController',
			controllerAs: 'main'
		})		
		.when('/help', {
			templateUrl: 'app/help/help.html',
			controller: 'HelpController',
			controllerAs: 'help'
		})
		.otherwise({
			redirectTo: '/'
		});
	}

})();
