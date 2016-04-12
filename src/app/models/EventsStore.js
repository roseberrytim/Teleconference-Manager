/*globals moment */
(function () {
	'use strict'
	
	angular.module('sharepoint').factory('EventsStore', function ($q, $collection, SPList, Event) {
			
		return $collection.extend({
			listName: '',
			idAttribute: 'ID',			
			initialize: function (config) {
				this.listName = config.listName || 'Events'
			},
			getFields: function () {
				return Event.getFields();
			},
			getMyEvents: function (query) {
				query = query || '';
				var me = this,					
					fields = me.getFields();
				return SPList.getListItems(me.listName, query, fields)
					.then(function (items) {
						me._reset();
						
						angular.forEach(items, function (item) {
							me.add(new Event(item));
						});
						
						return me.all();
					});
			},
			getAvailableResource: function (startDateTime, endDateTime, eventData) {
				// Need to check if this is an existing event and there is only one event returned on check for availablity do comparison to see if
				// it matches this event and if so then reuse the same resource
				eventData = eventData || {};
				
				var me = this,
					sdt = moment(startDateTime).format("YYYY-MM-DDTHH:mm:ssZ"),
					edt = moment(endDateTime).format("YYYY-MM-DDTHH:mm:ssZ"),
					//id = eventData.getId() || false,
					eventQuery = '<View><Query><Where><Or>' +
						'<And>' + 
							'<Geq><FieldRef Name="StartDateTime" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + sdt + '</Value></Geq>' +
							'<Leq><FieldRef Name="StartDateTime" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + edt + '</Value></Leq>' +
						'</And>' +
						'<And>' +
							'<Geq><FieldRef Name="EndDateTime" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + sdt + '</Value></Geq>' +
							'<Leq><FieldRef Name="EndDateTime" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + edt + '</Value></Leq>' +
						'</And>' +
					'</Or></Where></Query></View>',
									
					eventFields = ['ID', 'StartDateTime', 'EndDateTime', 'Resource'],
					resourceFields = ['ID', 'ResourceID'],					
					resourceCollection = [];
					
				return SPList.getListItems('ResourceLookup', '', resourceFields)
					.then(function (resources) {
						angular.forEach(resources, function (resource) {
							var resId = resource.ResourceID;
							if (resId) {
								resourceCollection.push(resId)
							}
						});
						return SPList.getListItems(me.listName, eventQuery, eventFields)
					})
					.then(function (events) {
						angular.forEach(events, function (event) {
							var _event = new Event(event),
								//_eventId = _event.getId(),
								eventResource = _event.get('Resource'),
								resIndex = resourceCollection.indexOf(eventResource);
							if (resIndex !== -1) {
								resourceCollection.splice(resIndex, 1)
							}
						});
						return resourceCollection.shift() || false
					})
					.catch(function (errorMsg) {
						return errorMsg;
					});
			},
			createEvent: function (event) {
				var me = this,
					fields = me.getFields();
				return SPList.createListItem(me.listName, event, fields)
					.then(function (item) {
						me.add(new Event(item));
						return me.all();
					});
			},
			updateEvent: function (event, updates) {
				var me = this,
					id = event.getId();
				return SPList.updateListItem(me.listName, id, updates)
					.then(function (item) {
						event.setData(item)
						me.update(event);
						
						return me.all();
					});				
			},
			removeEvent: function (event) {
				var me = this,
					id = event.getId();
				
				if (id) {
					return SPList.deleteListItem(me.listName, id)
						.then(function () {						
							return me.removeById(id).all();
						});
				} else {
					throw( new Error('There is no "ID" assigned to the requested Event'));	
				}
			},
			removeById: function (objId) {
				var obj = this.hash[objId];
				
				if (obj) {
					return this.remove(obj)
				} else {
					return this;
				}
			}
		});
	});

})();