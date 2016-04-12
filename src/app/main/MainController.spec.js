(function() {
  'use strict';

  describe('controllers', function(){
    var vm;

    beforeEach(module('teleconference'));
    beforeEach(inject(function(_$controller_) {
     
      vm = _$controller_('MainController');
     
    }));

    it('should have a showAll Event boolean configuration', function() {
      expect(vm.showAll).toEqual(false);
    });

    it('should contain a list of events ', function() {
      expect(angular.isArray(vm.myEvents)).toBeTruthy();
    });
  });
})();
