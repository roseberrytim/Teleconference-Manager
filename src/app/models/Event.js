/*globals moment*/
(function () {	
	"use strict";
	angular.module('teleconference')
		.factory('Event', function () {
		
			var _fields = {
				'ID': {type: 'Number'},
				'Title': {type: 'Text'},
				'Resource': {type: 'Lookup'},
				'StartDateTime': {type: 'DateTime'},
				'EndDateTime': {type: 'DateTime'},
				'EventType': {type: 'Text'},
				'Organization': {type: 'Text'},
				'Participants': {type: 'Text'},
				'Duration': {type: 'Number'}
			};			
			
			/**
			 * Constructor, with class name
			 */
			function Event(data) {
				var me = this,
					field;
								
				for (field in _fields) {
					me[field] = '';
				}
				if (data) {
					me.setData(data);
				}
			}			
			
			Event.prototype.setData = function (data) {
				if (data) {
					var key, convertFn, value;
					for (key in data) {
						if (this.hasOwnProperty(key)) {							
							convertFn = Event.getFieldTypeConverter(_fields[key].type);
							value = data[key];
							if (convertFn) {
								value = convertFn(value)
							}
							this[key] = value;
						}
					}
				}
			}
			Event.prototype.set = function (field, value) {
				if (this.hasOwnProperty(field)) {
					this[field] = value;
				}
			}
			Event.prototype.get = function (field) {
				var value;
				if (this.hasOwnProperty(field)) {
					value = this[field]
				}
				return value;
			}
			Event.prototype.getId = function () {
				return this.ID
			}
			Event.getFieldTypeConverter = function (type) {
				var types = {					
					'DateTime': function (v) {
						return moment(v).toDate();
					},
					'Lookup': function (v) {
						return v.get_lookupValue();
					}
				}
				return (types[type] ? types[type] : false);
			}
			Event.getFields = function () {
				var fields = [],
					field;
				
				for (field in _fields) {
					fields.push(field)
				}
				
				return fields;
			}
			Event.getFieldConfig = function (field) {
				return (field && _fields[field]) ? _fields[field] : false
			}
			
			/**
			 * Return the constructor function
			 */
			return Event;
		})
})();