/*globals SP */
(function () {
	"use strict";
	angular.module('sharepoint', [])
	.provider('SPList', function () {
		var clientCtx;
		var web;
		var configuration = {};
		this.$get = ['$q',"$log", function ($q,$log) {
			var contextLoaded = $q.defer();			
			
			SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
				clientCtx = SP.ClientContext.get_current();
				web = clientCtx.get_web();
				contextLoaded.resolve();
			});
			
			function createServiceForConfiguration() {
				var service = {};
				
				service.self = service;
				service.clientCtx = clientCtx;
				service.web = web;
				service.getListItems = function (listName, queryString, fieldNames) {
					var deferred = $q.defer();
					contextLoaded.promise.then(function () {
						var list = web.get_lists().getByTitle(listName),							
							query = new SP.CamlQuery(),
							listItems, fieldList;
						
						query.set_viewXml(queryString);
						listItems = list.getItems(query);
						fieldList = fieldNames.join(",");
						
						clientCtx.load(listItems,"Include("+fieldList+")" );
						clientCtx.executeQueryAsync(function () {
							var resultItems = [],
								listItemEnumerator = listItems.getEnumerator(),
								listItem, values;
							
							while (listItemEnumerator.moveNext()) {
								listItem = listItemEnumerator.get_current();
								values = listItem.get_fieldValues();
								resultItems.push(values);
							}
							deferred.resolve(resultItems);
						}, function (sender, args) {
							var message = "Loading of list " + listName + " failed with error. " + args.get_message() + "\n" + args.get_stackTrace();
							$log.error(message);
							deferred.reject(message)
						})
					});
					return deferred.promise;
				};
				service.createListItem = function (listName, item, fields) {
					var deferred = $q.defer();
					contextLoaded.promise.then(function () {
						var list = web.get_lists().getByTitle(listName);
						var itemCreateInfo = new SP.ListItemCreationInformation();
						var listItem = list.addItem(itemCreateInfo);
						for (var property in item)
						{
							var includeField;
							if (!fields)
							{
								includeField = true;
							}
							else {
								includeField = false;
								for (var j = 0; j<fields.length; j++){
									if (fields[j]===property){
										includeField=true;
										break;
									}
								}
							}
							if (item.hasOwnProperty(property) && includeField) {
								listItem.set_item(property, item[property]);
							}
						}
						listItem.update();
						clientCtx.load(listItem);
						clientCtx.executeQueryAsync(function () {
							deferred.resolve(listItem.get_fieldValues());
						}, function (sender, args) {
							var message = "Loading of list " + listName + " failed with error. " + args.get_message() + "\n" + args.get_stackTrace();
							$log.error(message);
							deferred.reject(message)
						})
					});
					return deferred.promise;
				};
				service.deleteListItem = function (listName, itemId) {
					var deferred = $q.defer();
					contextLoaded.promise.then(function () {
						var list = web.get_lists().getByTitle(listName);
						var listItems = list.getItemById(itemId);
						listItems.deleteObject();
						clientCtx.executeQueryAsync(function () {
							deferred.resolve();
						}, function (sender, args) {
							var message = "Loading of list " + listName + " failed with error. " + args.get_message() + "\n" + args.get_stackTrace();
							$log.error(message);
							deferred.reject(message)
						})
					});
					return deferred.promise;
				};
				service.updateListItem = function (listName, id, updates) {
					var deferred = $q.defer();
					contextLoaded.promise.then(function () {
						var list = web.get_lists().getByTitle(listName),
							listItem = list.getItemById(id),
							property;
						for (property in updates) {
							if (updates.hasOwnProperty(property) && property != "ID") {
								listItem.set_item(property, updates[property]);
							}
						}
						listItem.update();
						clientCtx.load(listItem);
						clientCtx.executeQueryAsync(function () {
							deferred.resolve(listItem.get_fieldValues());
						}, function (sender, args) {
							var message = "Loading of list " + listName + " failed with error. " + args.get_message() + "\n" + args.get_stackTrace();
							$log.error(message);
							deferred.reject(message)
						})
					});
					return deferred.promise;
				};
				
				return service;
			}
			return createServiceForConfiguration(configuration);
		}];
	});
})();