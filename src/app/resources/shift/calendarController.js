(function() {
  angular.module('formioAppBasic')
    .controller('calendarController', function($scope, moment, calendarConfig) {

    var vm = this;

    calendarConfig.templates.calendarMonthCell = 'views/calendar/dayTemplate.html';

    console.log(calendarConfig); //view all available config

    vm.events = [];
    vm.calendarView = 'month';
    vm.viewDate = moment().startOf('month').toDate();

    $scope.$on('$destroy', function() {
      calendarConfig.templates.calendarMonthCell = 'mwl/calendarMonthCell.html';
    });
  })
})();
