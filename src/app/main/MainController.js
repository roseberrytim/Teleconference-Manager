(function() {
	'use strict';

	angular.module('teleconference')
		.controller('MainController', function ($scope, toastr, reservationManager, modalService) {
			var vm = this;			
			vm.submitted = false;			
			vm.showAll = false;			
			vm.event = {};			
			vm.myEvents = reservationManager.events;
									
			vm.calendarOpen = {
				end: false,
				start: false				
			};			
			vm.toggleCalendar = function  (cal) {
				vm.calendarOpen[cal] = !vm.calendarOpen[cal];
			};
			
			vm.removeEvent = function (e, event) {				
				e.stopPropagation();
				
				modalService.showModal({
					closeButtonText: 'Cancel',
					actionButtonText: 'Delete Event',
					headerText: 'Delete ' + event.Title + '?',
					bodyText: 'Are you sure you want to delete this event?'
				})
				.then(function () {					
					reservationManager.removeEvent(event).then(_responseHandler);
				});				
			};
			vm.createEvent = function (e) {
				e.stopPropagation();
				vm.submitted = true;
				if (vm.reservationForm.$valid) {
					reservationManager.createEvent(vm.event).then(_responseHandler);
				} else {
					toastr.error('The form contains invalid information', 'Error')
				}
			};
			vm.updateEvent = function (e) {
				e.stopPropagation();
				vm.submitted = true;
				if (vm.reservationForm.$valid) {					
					reservationManager.updateEvent(vm.event).then(_responseHandler);
				}  else {
					toastr.error('The form contains invalid information', 'Error')
				}
			}
			vm.loadEvent = function (event) {				
				vm.event = angular.copy(event);
			}
			vm.resetForm = function () {				
				vm.event = {};				
				vm.submitted = false;
				vm.reservationForm.$setPristine();
			};
			vm.refreshReservations = function () {
				getReservations(vm.showAll);
			};			
			
			function _responseHandler(error) {
				if(error) {
					toastr.error(error.message, 'Error')
				} else {
					toastr.success('The Event request was successful.', 'Success')
					vm.resetForm();
				}
			}
			
			function getReservations(all) {			
				var loading = toastr.info('Please wait...', 'Loading', {
					timeOut: false
				})
				
				reservationManager.getMyEvents(all).then(function () {
					vm.resetForm();
					toastr.clear(loading)
				});				
			}
			
			getReservations(vm.showAll);
			
		});
})();
