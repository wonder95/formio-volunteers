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
  },
  roles: {
    admin: '573510f8ffaa7a0100a57179',
    anonymous: '573510f8ffaa7a0100a5717b',
    authenticated: '573510f8ffaa7a0100a5717a',
    support: '573511bcffaa7a0100a5718b',
    suppression: '573511a8ffaa7a0100a5718a',
    trainingStaff: '573610032a85250100aef138',
    volunteerStaff: '57351171ffaa7a0100a57189',
    readOnly: '57351212ffaa7a0100a5718c'
  },
  stations: [
    {
      id: "RH",
      positions: ['RH2', 'RH16', 'RH14']
    },
    {
      id: "WT",
      positions: ['WT10', 'WT11', 'WT12', 'WT13', 'WT14', 'WT18']
    },
    {
      id: 12,
      positions: ['AO', 'FF', 'PFF']
    },
    {
      id: 13,
      positions: ['AO', 'FF', 'PFF']
    },
    {
      id: 18,
      positions: ['AO', 'FF', 'PFF']
    },
    {
      id: 19,
      positions: ['AO', 'FF', 'PFF']
    }
  ],
  dayParts: ['am','pm']
});
