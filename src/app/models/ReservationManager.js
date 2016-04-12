/*globals moment*/
(function () {	
	"use strict";
	angular.module('teleconference')		
		.factory('reservationManager', function ($q, $log, $timeout, SPList, EventsStore) {
			
			var reservationManager = {				
				events: [],
				eventStore: new EventsStore({
					listName: 'Events'
				}),
				
				getMyEvents: function (all) {
					var me = reservationManager,
						allQuery = "<View><Query><Where><Eq><FieldRef Name='Author' /><Value Type='Integer'><UserID Type='Integer' /></Value></Eq></Where><OrderBy><FieldRef Name='StartDateTime' Ascending='True'/><Value Type='DateTime' IncludeTimeValue='True'></Value></OrderBy></Query><RowLimit>0</RowLimit></View>",
						upcomingQuery = "<View><Query><Where><And><Eq><FieldRef Name='Author' /><Value Type='Integer'><UserID Type='Integer' /></Value></Eq><Geq><FieldRef Name='StartDateTime' /><Value Type='DateTime'><Today/></Value></Geq></And></Where><OrderBy><FieldRef Name='StartDateTime' Ascending='True'/><Value Type='DateTime' IncludeTimeValue='True'></Value></OrderBy></Query><RowLimit>0</RowLimit></View>";
					
					return me.eventStore.getMyEvents(all ? allQuery : upcomingQuery)
					.then(me._loadEvents)
					.catch(me._errorHandler);
				},
				createEvent: function (event) {
					var me = reservationManager,
						startDateTime = event['StartDateTime'],
						endDateTime = event['EndDateTime'];
					return me.eventStore.getAvailableResource(startDateTime, endDateTime).then(function (resourceId) {
						if (resourceId) {
							event['Resource'] = resourceId;
							return me.eventStore.createEvent(event)
						} else {
							throw( new Error('There is no "Resource" available for your selected date/time range'));
						}
					})
					.then(me._loadEvents)
					.catch(me._errorHandler);
				},
				updateEvent: function (event) {
					var me = reservationManager,
						eventId = event.getId(),
						orgEvent, changes, osd, oed, nsd, ned;
					
					if (eventId) {
						orgEvent = me.eventStore.get(eventId);						
						if (orgEvent) {
							changes = me.getChanges(orgEvent, event);
							if ((changes.hasOwnProperty('StartDateTime')) || changes.hasOwnProperty('EndDateTime')) {
								osd = orgEvent.get('StartDateTime');
								oed = orgEvent.get('EndDateTime');
								nsd = event.get('StartDateTime');
								ned = event.get('EndDateTime');
								
								if (!(moment(nsd).isBetween(osd, oed)) && !(moment(ned).isBetween(osd, oed))) {
									return me.eventStore.getAvailableResource(nsd, ned, event)
									.then(function (resourceId) {
										if (resourceId) {
											angular.extend(changes, {'Resource': resourceId})										
											return me.eventStore.updateEvent(orgEvent, changes)
										}
										throw( new Error('There is no "Resource" available for your selected date/time range'));										
									})
									.then(me._loadEvents)
									.catch(me._errorHandler);
								}
							}
							return me.eventStore.updateEvent(orgEvent, changes)
							.then(me._loadEvents);
						}
					}
					return $q.when('There is no "ID" associated with the Event')
				},
				removeEvent: function (event) {
					var me = reservationManager;
						
					return me.eventStore.removeEvent(event)
					.then(me._loadEvents)
					.catch(me._errorHandler);
				},
				getChanges: function(original, modified){
					var changes = {},
						key;

					for (key in modified) {						
						if (!angular.equals(original[key], modified[key])){
							changes[key] = modified[key]
						}					
					}
					return changes;
				},
				_loadEvents: function (events) {
					if (events) {
						angular.copy(events, reservationManager.events)
					}
					return;
				},
				_errorHandler: function (errorMsg) {
					return errorMsg;
				}				
			}
			
			return reservationManager;
		});
})();