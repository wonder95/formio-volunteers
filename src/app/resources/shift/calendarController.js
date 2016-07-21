(function() {
  angular.module('formioAppBasic')
    .controller('calendarController', function($scope, moment, calendarConfig, $http, Formio, shiftService, AppConfig, $q) {

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

    vm.cellModifier = function(cell) {
      $q.all([stationPromise, shiftPromise]).then(function() {
        cell.text = 'Day has shifts';
        //var stations = vm.appConfig.stations;
        var stations = vm.configSlots;
        var dayParts = vm.appConfig.dayParts;
        var monthShifts = vm.events;
        // var currentUser = $rootScope.user;
        // Get the date for the cell.
        this.cellDate = moment(cell.date).format('YYYY-MM-DD');
       // Iterate over shifts to get ones for this day.
        this.cell = cell;
        vm.todayShifts = [];

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
              var position = slot.position;
              var name = slot.name.data.fullName;
              var userId = slot.name._id;

              return {
                "position": position,
                "name": name,
                "userId": userId
              };
            });

            // Add slots to object.
            shiftData.slots = slots;

            vm.todayShifts[shift.data.ampm].push(shiftData);
          }
        });
        // Add arrays to cell object.
        if (typeof vm.todayShifts.am != 'undefined' || typeof vm.todayShifts.pm != 'undefined') {
          cell.todayHasShifts = true;
        }

        // Now we need to build all necessary tables from the defined list, and then fill in
        // the registered shift slots where they exist.
        vm.shiftTables = [];

        dayParts.forEach(function(dayPart){
          stations.forEach(function(station) {
            // Get shift from todayShifts if there is one.
            if (typeof vm.todayShifts[dayPart] != 'undefined') {
              vm.todayShift = _.find(vm.todayShifts[dayPart], function(shift){
                return shift.station == station.id;
              });
            }

            // Build table for station.
            var obj = {
              dayPart: dayPart,
              station: station.id,
              slots: []
            };

            // Loop through defined positions
            station.positions.forEach(function(position) {
              // Look for match in vm.todayShift if it exists.
              obj.slots.push({
                position: position,
                name: position + " Name"
              });
            });

            //TODO: Fill in slots from vm.todayShifts.

            vm.shiftTables.push(obj);
          });
        });

        cell.shiftTables = vm.shiftTables;
      })
    };

    $scope.$on('$destroy', function() {
      calendarConfig.templates.calendarMonthCell = 'mwl/calendarMonthCell.html';
    });
  });
})();
