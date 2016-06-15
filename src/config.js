var APP_URL = 'https://nutmvrwoblsalot.form.io';
var API_URL = 'https://api.form.io';

// Parse query string
var query = {};
location.search.substr(1).split("&").forEach(function(item) {
  query[item.split("=")[0]] = item.split("=")[1] && decodeURIComponent(item.split("=")[1]);
});

APP_URL = query.appUrl || APP_URL;
API_URL = query.apiUrl || API_URL;

angular.module('formioAppBasic').constant('AppConfig', {
  appUrl: APP_URL,
  apiUrl: API_URL,
  forms: {
    userForm: APP_URL + '/user',
    userLoginForm: APP_URL + '/login',
    userRegisterForm: APP_URL + '/user/register'
  },
  resources: {
    volunteer: {
      form: APP_URL + '/volunteer',
      resource: 'VolunteerResource'
    },
    staff: {
      form: APP_URL + '/staff',
      resource: 'StaffResource'
    },
    shift: {
      form: APP_URL + '/shift',
      resource: 'ShiftResource'
    },
    training: {
      form: APP_URL + '/training',
      resource: 'TrainingResource'
    },
    event: {
      form: APP_URL + '/event',
      resource: 'EventResource'
    }
  }
});
