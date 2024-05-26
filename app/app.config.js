angular.module('GerenciamentoColaboradores').config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('')
  },
])
