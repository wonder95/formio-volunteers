(function() {
  'use strict';
  angular.module('formioAppBasic', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'formio',
    'ngFormioHelper',
    'mwl.calendar',
    'ngAnimate'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    'FormioProvider',
    'FormioAuthProvider',
    'FormioResourceProvider',
    'AppConfig',
    'calendarConfig',
    '$injector',
    '$locationProvider',
    function(
      $stateProvider,
      $urlRouterProvider,
      FormioProvider,
      FormioAuthProvider,
      FormioResourceProvider,
      AppConfig,
      calendarConfig,
      $injector,
      $locationProvider
    ) {
      FormioProvider.setAppUrl(AppConfig.appUrl);
      FormioProvider.setBaseUrl(AppConfig.apiUrl);
      FormioAuthProvider.setForceAuth(true);
      FormioAuthProvider.setStates('auth.login', 'home');
      FormioAuthProvider.register('login', 'user', 'login');
      FormioAuthProvider.register('register', 'user', 'register');

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/home.html',
        })
        .state ('calendar', {
          url : '/calendar',
          templateUrl: 'views/calendar/index.html',
          controller: 'calendarController',
          controllerAs: 'vm'
        });

      // Register all of the resources.
      angular.forEach(AppConfig.resources, function(resource, name) {
        FormioResourceProvider.register(name, resource.form, $injector.get(resource.resource + 'Provider'));
      });

      $urlRouterProvider.otherwise('/');

      $locationProvider.html5Mode(true);

    }
  ]);
})();
