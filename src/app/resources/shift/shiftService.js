(function() {
  angular
    .module('formioAppBasic')
    .service('shiftService', shiftService);

  shiftService.$inject = ['$http', 'Formio'];
  function shiftService($http, Formio) {
    var getShiftsMonth = function (token, startDate, endDate) {
      var config = {
        headers: {
          'x-jwt-token' : token
        },
        params: {
          'date.date__gte': startDate,
          'date.date__lte': endDate,
        }
      };

      // We have to manually add params because for some reason, passing the confi
      // object to $http.get() isn't working.
      var shiftUrl = APP_URL + '/shift/submission?data.date__gte=' + startDate + '&data.date__lte=' + endDate;
      return $http.get(shiftUrl)
      //return $http.get('data/shifts_september.json')
        .then(function(response) {
           return response.data;
        },
        function(error) {
          return $q.reject(error.data);
        });
    };

    var getStationConfig = function() {
      // Get position info from appropriate Config resource submission.
      // Code borrowed from ngFormioHelper.FormioAuth.
      var token = localStorage.getItem('formioToken');
      var config = {
        headers: {
          "x-jwt-token": token
        }
      };
      //return $http.get(Formio.getAppUrl() + '/config/submission', config)
      return $http.get('data/config.json')
        .then(function(result) {
          var stations = result.data;
          var allSlots = [];
          angular.forEach(stations[0].data, function(stationData, key) {
            var stationObj = {};
            var stationSlots = [];
            if (key.substring(0, 7) == 'station') {
              // This is a station config object, so get slots.
              var stationNum = key.substring(7);
              stationObj.id = stationNum;
              var positionName = "position" + stationNum;
              var positionId = "positionId" + stationNum;
              angular.forEach(stationData, function(slotData, slotKey) {
                // Create object to add to stationSlots
                var positionObj = {
                  positionName: slotData[positionName],
                  positionId: slotData[positionId]
                };

                // Add object to stationSlots array.
                stationSlots.push(positionObj);
              });
              // Add positions to station object.
              stationObj.positions = stationSlots;
              allSlots.push(stationObj);
            }
          });
           return allSlots;
        },
        function(err) {
          console.log(err);
        });
    };

    // Function to check to see if current user is allowed to sign up for a
    // particular slot.
    var checkSlotAccess = function(currentUser, position) {
      var slotAccess = 0;
      switch (position) {
        case 'AO':
          slotAccess = currentUser.data.driving.ao ? 1 : 0;
          break;
        case 'PFF':
          slotAccess = currentUser.probationary ? 1 : 0;
          break;
        case 'FF':
          slotAccess = (currentUser.data.group == 'suppression' && !currentUser.data.probationary) ? 1 : 0;
          break;
        default:
          slotAccess = 0;
          break;
      }
      return slotAccess;
    };

    var addNameToShift = function(locationid, userId) {
      var addTest = 1;

    };

    var removeNameFromShift = function(currentUser) {
      var addTest = 1;

    };




    return {
      getShiftsMonth: getShiftsMonth,
      getStationConfig: getStationConfig,
      checkSlotAccess: checkSlotAccess,
      addNameToShift: addNameToShift,
      removeNameFromShift:removeNameFromShift
    };
  }
})();
