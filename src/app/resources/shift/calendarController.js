(function() {
  angular.module('formioAppBasic')
    .controller('calendarController', function($scope, moment, calendarConfig, calendarHelper, $http, Formio, shiftService, AppConfig, $q) {

    var vm = this;

    calendarConfig.templates.calendarMonthCell = 'views/calendar/dayTemplate.html';
    calendarConfig.dateFormatter = 'moment';

    vm.events = [];
    vm.calendarView = 'month';
    vm.viewDate = moment().startOf('month').toDate();
    vm.appConfig = AppConfig;
    vm.currentUser = Formio.getUser();
    // Get station config.
    var stationPromise = shiftService.getStationConfig().then(function(data) {
      vm.configSlots = data;
    });

    var onShifts = function(data) {
      vm.events = data;
    };

    var onError = function(error) {
      vm.error = 'There was an error.';
    };

    var startDate = moment(this.viewDate).toISOString();
    var endDate = moment(this.viewDate).endOf('month').toISOString();

    var endpoint = APP_URL + '/shift/submission';
    var token = Formio.getToken();

    var shiftPromise = shiftService.getShiftsMonth(token, startDate, endDate);
    shiftPromise.then(onShifts, onError);

    $scope.$watch('vm.viewDate', function () {
      // Get full range of days displayed for the month.
      var monthView = calendarHelper.getMonthView(vm.events, vm.viewDate, vm.cellModifier);
      var allDays = monthView.days;
      var allDaysLast = allDays.length - 1;

      // Get date range for month, including days from previous and following month
      // that are displayed.
      var startDate = moment(allDays[0].date).startOf('day').toISOString();
      var endDate = moment(allDays[allDaysLast].date).endOf('day').toISOString();

      // Get shift data from API.
      var shiftPromise = shiftService.getShiftsMonth(token, startDate, endDate);
      shiftPromise.then(onShifts, onError);
    });

    vm.addName = function(userId) {
      var addTest = 1;
    };

    vm.removeName = function(userId) {
      var addTest = 1;
    };

    vm.cellModifier = function(cell) {
      $q.all([stationPromise, shiftPromise]).then(function() {
        cell.text = 'Day has shifts';
        var stations = vm.configSlots;
        var dayParts = vm.appConfig.dayParts;
        var monthShifts = vm.events;
        // Get the date for the cell.
        this.cellDate = moment(cell.date).format('YYYY-MM-DD');
       // Iterate over shifts to get ones for this day.
        this.cell = cell;
        vm.todayShifts = [];

        // monthShifts contains all of the shift records for the month, so loop through
        // them all and categorize each one by date and time of day (am or pm).
        monthShifts.forEach(function(shift, index) {
          var shiftDate = moment(shift.data.date).format('YYYY-MM-DD');
          // Now we need to see if this shift belongs to this day.
          if (moment(this.cellDate).isSame(moment(shiftDate))) {
            // Shift is today, so let's put it into the appropriate array.
            if (typeof vm.todayShifts[shift.data.ampm] == 'undefined') {
              // Initialize the shifts as an array.
              vm.todayShifts[shift.data.ampm] = [];
            }
            // We need to extract just the relevant data for the table
            // (station,position, name), create an object, and add it to the todayShift array.
            // We are assuming that there will only be one shift per station per period (am/pm)
            // since the UI and the insert code will always check for that.
            var shiftData = {
              "station": parseInt(shift.data.station),
              "slots": []
            };

            var slots = _.map(shift.data.slots, function(slot) {
              return {
                "position": slot.position,
                "positionId": slot.positionId,
                "name": slot.name.data.fullName,
                "userId": slot.name._id
              };
            });

            // Add slots to object.
            shiftData.slots = slots;

            vm.todayShifts[shift.data.ampm].push(shiftData);
          }
        });
        // Add variable to use on calendar page to tell when a day should have shifts.
        if (typeof vm.todayShifts.am != 'undefined' || typeof vm.todayShifts.pm != 'undefined') {
          cell.todayHasShifts = true;
        }

        // Now we need to build all necessary tables from the defined list, and then fill in
        // the registered shift slots where they exist.
        vm.shiftTables = [];

        dayParts.forEach(function(dayPart){
          stations.forEach(function(station) {
            // Get shift from todayShifts if there is one.
            if (typeof vm.todayShifts[dayPart] !== 'undefined') {
              vm.todayShift = _.find(vm.todayShifts[dayPart], function(shift){
                return shift.station == station.id;
              });
            }

            // Build table for station.
            var tableObj = {
              dayPart: dayPart,
              station: station.id,
              slots: []
            };

            // Loop through defined positions
            station.positions.forEach(function(position, index) {
              var name = '';
              var isUser = 0;
              var nameOption = '';
              // Create variable of positionId we are looking to match in the shift data.
              var pagePositionId = index + 1;
              // Look for match in vm.todayShift if it exists. At this point we are
              // in the appropriate dayPart, and since there is only one shift per station
              // per dayPart, if we find an array in vm.todayShift, it's the one we want.
              if (typeof vm.todayShift !== 'undefined')  {
                // Need to get values from corresponding slot in todayShift.slots.
                // If there is a match in vm.todayShift.slots[x].positionId, get the name.
                var matchPosition = _.find(vm.todayShift.slots, function(slot){
                  return slot.positionId == position.positionId;
                });

                // Set one of four possible variables for nameOption:
                // printNameRemove,  printName, printSignupLink, printBlank

                // There is a name here, so display it.
                if (matchPosition) {
                  name = matchPosition.name;
                  // Set a value so in the template we know to display this as
                  // a link to remove the signup.
                  nameOption = matchPosition.userId === vm.currentUser._id ? 'printNameRemove' : 'printName';
                }
                // No registration for this slot, so show a signup link.
                else {
                  name = "Sign Up";
                  // We also need to determine if the person has the ability to
                  // sign up for this slot based on things like whether or not
                  // they are an AO, a PFF, etc.
                  var signupAllowed = shiftService.checkSlotAccess(vm.currentUser, position.positionName);
                  nameOption = signupAllowed ? 'printSignupLink' : 'printBlank';
                }
              }
              // There are no shifts for today.
              else {
                name = "Sign Up";
                // We need to determine if the person has the ability to
                // sign up for this slot based on things like whether or not
                // they are an AO, a PFF, etc.
                var signupAllowed = shiftService.checkSlotAccess(vm.currentUser, position.positionName);
                if(signupAllowed) {
                  nameOption = 'printSignupLink';
                }
                else {
                  nameOption = 'printBlank';
                }
              }

              // Add final filled object to table object.
              tableObj.slots.push({
                position: position.positionName,
                positionId: position.positionId,
                name: name,
                isUser: isUser,
                nameOption: nameOption
              });
            });

            vm.shiftTables.push(tableObj);
          });
        });
        // Create the final object passed to the calendar template.
        cell.shiftTables = vm.shiftTables;
      });
    };

    $scope.$on('$destroy', function() {
      calendarConfig.templates.calendarMonthCell = 'mwl/calendarMonthCell.html';
    });
  });
})();
