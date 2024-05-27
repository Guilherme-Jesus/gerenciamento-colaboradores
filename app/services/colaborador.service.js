angular.module('GerenciamentoColaboradores').factory('ColaboradorService', [
  '$http',
  '$q',
  '$timeout',
  function ($http, $q, $timeout) {
    var apiUrl = 'http://localhost:3000/'
    var searchTimeout
    var cargosCachePromise = null
    var colaboradoresCache = {}

    function getCargos(ignoreCache) {
      if (!cargosCachePromise || ignoreCache) {
        cargosCachePromise = $http
          .get(`${apiUrl}cargos`)
          .then((response) => response.data)
      }
      return cargosCachePromise
    }

    function getColaboradores(pagina, quantidade, ignoreCache) {
      var cacheKey = `${pagina}-${quantidade}`
      if (!colaboradoresCache[cacheKey] || ignoreCache) {
        colaboradoresCache[cacheKey] = $http
          .get(`${apiUrl}colaboradores?_page=${pagina}&_per_page=${quantidade}`)
          .then((response) => response)
      }
      return colaboradoresCache[cacheKey]
    }

    function getColaboradorById(colaboradorId) {
      return $http
        .get(`${apiUrl}colaboradores/${colaboradorId}`)
        .then((response) => response.data)
    }
    function carregarColaborador(colaboradorId) {
      return getColaboradorById(colaboradorId).then((colaborador) => {
        if (!colaborador.cargo) {
          colaborador.cargo = { id: null } // Garantindo que há um objeto cargo
        }
        return getCargos(true).then((cargosData) => {
          var cargoEncontrado = cargosData.find(
            (cargo) => cargo.id === colaborador.cargo.id
          )
          if (!cargoEncontrado) {
            cargoEncontrado = {
              id: colaborador.cargo.id,
              descricao: 'Cargo não encontrado',
            } // Caso o cargo não seja encontrado
          }
          return {
            ...colaborador,
            cargo: cargoEncontrado,
          }
        })
      })
    }

    function atualizarColaborador(colaboradorId, dadosColaborador) {
      return $http
        .put(`${apiUrl}colaboradores/${colaboradorId}`, dadosColaborador)
        .then((response) => response.data)
    }

    function processarColaboradores(colaboradoresData, cargosData) {
      var cargosMap = cargosData.reduce((map, cargo) => {
        map[cargo.id] = cargo // Agora armazenamos o objeto completo do cargo
        return map
      }, {})

      return colaboradoresData.map((colaborador) => {
        var cargoCompleto = cargosMap[colaborador.cargo.id.toString()] || {
          id: colaborador.cargo.id,
          descricao: 'Cargo não encontrado',
        }
        return {
          ...colaborador,
          cargo: cargoCompleto, // Substitui o objeto cargo pelo completo
        }
      })
    }

    function criarColaborador(dadosColaborador) {
      return $http
        .post(`${apiUrl}colaboradores`, dadosColaborador)
        .then((response) => response.data)
    }

    function deletarColaborador(colaboradorId) {
      return $http.delete(`${apiUrl}colaboradores/${colaboradorId}`)
    }

    var service = {
      listarColaboradores: function (pagina, quantidade, ignoreCache) {
        return getColaboradores(pagina, quantidade, ignoreCache).then(
          (response) => {
            return getCargos(false).then((cargosData) => ({
              colaboradores: processarColaboradores(response.data, cargosData),
              total: response.data.length,
              maxPerPage: quantidade,
            }))
          }
        )
      },

      pesquisarPorNome: function (nome, pagina, quantidade) {
        if (searchTimeout) {
          $timeout.cancel(searchTimeout)
        }

        var deferred = $q.defer()
        searchTimeout = $timeout(function () {
          $http
            .get(
              `${apiUrl}colaboradores?nome_like=${nome}&_page=${pagina}&_per_page=${quantidade}`
            )
            .then(function (response) {
              return getCargos(false).then((cargosData) => ({
                colaboradores: processarColaboradores(
                  response.data,
                  cargosData
                ),
                total: response.data.length,
                maxPerPage: quantidade,
              }))
            })
            .then(deferred.resolve, deferred.reject)
        }, 500)
        return deferred.promise
      },

      carregarColaborador,
      criarColaborador,
      deletarColaborador,
      getCargos,
      editarColaborador: atualizarColaborador,
    }

    return service
  },
])
