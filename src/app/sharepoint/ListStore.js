(function () {
	'use strict'
	
	angular.module('sharepoint').factory('ListStore', function ($collection) {
		return $collection.extend({
			listName: '',
			idAttribute: 'ID',			
			initialize: function (config) {
				this.listName = config.listName || ''
			}
		});
	});

})();