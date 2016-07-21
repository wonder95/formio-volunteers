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
           limit: 10
        }
      };
      //var shiftUrl = APP_URL + '/shift/submission';
      //return $http.get(shiftUrl, config)
      return $http.get('data/shifts.json')
        .then(function(response) {
           return response.data;
        },
        function(error) {
          return $q.reject(error.data);
        });
    };
/*
    var addNameToShift = function(locationid) {
      return $http.get('/api/locations/' + locationid);
    }; */

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
              angular.forEach(stationData, function(slotData, slotKey) {
                stationSlots.push(slotData[positionName]);
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

    return {
      getShiftsMonth: getShiftsMonth,
    //addNameToShift: addNameToShift,
      getStationConfig: getStationConfig
    };
  }
})();