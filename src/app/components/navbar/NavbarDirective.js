(function() {
  'use strict';

  angular
    .module('teleconference')
    .directive('appNavbar', appNavbar);

  /** @ngInject */
  function appNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {},
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController($location) {
		var vm = this;
		
		vm.navbarCollapsed = true;
		
		vm.routeIs = function(routeName) {			
			return $location.path() === routeName;
		};
		vm.toggleNavBar = function () {
			vm.navbarCollapsed = !vm.navbarCollapsed;
		}
		
    }
  }

})();
