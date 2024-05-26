angular.module('GerenciamentoColaboradores').config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/colaborador.template.html',
        controller: 'ColaboradorController',
      })
      .otherwise({
        redirectTo: '/',
      })
  },
])
