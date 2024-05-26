angular
  .module('GerenciamentoColaboradores')
  .controller('ColaboradorController', [
    '$scope',
    'ColaboradorService',
    '$filter',
    function ($scope, ColaboradorService, $filter) {
      $scope.colaboradores = []
      $scope.selectedColaborador = {}
      $scope.searchTerm = ''
      $scope.currentPage = 1
      $scope.pageSize = 10
      $scope.totalColaboradores = 0
      $scope.lastPageLoaded = false
      $scope.ignoreCache = false
      $scope.cargos = []
      $scope.novoColaborador = {}

      ColaboradorService.getCargos().then(function (cargos) {
        $scope.cargos = cargos
      })

      $scope.carregarColaboradores = function (ignoreCache) {
        ColaboradorService.listarColaboradores(
          $scope.currentPage,
          $scope.pageSize,
          ignoreCache
        )
          .then(function (data) {
            $scope.colaboradores = data.colaboradores
            $scope.totalColaboradores = data.total
            $scope.lastPageLoaded = data.colaboradores.length < data.maxPerPage
          })
          .catch(function (error) {
            console.error('Erro ao carregar os colaboradores:', error)
          })
      }

      $scope.pesquisarColaboradores = function () {
        ColaboradorService.pesquisarPorNome(
          $scope.searchTerm,
          $scope.currentPage,
          $scope.pageSize
        ).then(
          function (data) {
            $scope.colaboradores = data.colaboradores
            $scope.totalColaboradores = data.total
            $scope.lastPageLoaded = data.colaboradores.length < data.maxPerPage
          },
          function (error) {
            console.error('Erro ao pesquisar os colaboradores:', error)
          }
        )
      }
      $scope.abrirModalCriar = function () {
        $scope.novoColaborador = {}
        $('#createColaboradorModal').modal('show')
      }

      $scope.criarColaborador = function () {
        var dataFormatada = $filter('date')(
          $scope.novoColaborador.dataAdmissao,
          'yyyy-MM-dd'
        )

        var dadosParaCriacao = {
          nome: $scope.novoColaborador.nome,
          cpf: $scope.novoColaborador.cpf,
          dataAdmissao: dataFormatada,
          remuneracao: $scope.novoColaborador.remuneracao,
          cargo: { id: $scope.novoColaborador.cargoId },
        }

        ColaboradorService.criarColaborador(dadosParaCriacao).then(
          function (response) {
            $('#createColaboradorModal').modal('hide')
            $scope.totalColaboradores++
            $scope.lastPageLoaded = false
            if ($scope.totalColaboradores % $scope.pageSize === 1) {
              $scope.currentPage = Math.ceil(
                $scope.totalColaboradores / $scope.pageSize
              )
            }
            $scope.carregarColaboradores(
              $scope.currentPage,
              $scope.pageSize,
              true
            )
          },
          function (error) {
            console.error('Erro ao criar colaborador:', error)
            alert('Erro ao criar o colaborador: ' + JSON.stringify(error))
          }
        )
      }

      $scope.editarColaborador = function (colaboradorId) {
        ColaboradorService.carregarColaborador(colaboradorId)
          .then(function (data) {
            $scope.selectedColaborador = data
            console.log(data.cpf)
            if (data.cargo) {
              $scope.selectedColaborador.cargo = $scope.cargos.find(
                (c) => c.id === data.cargo.id.toString()
              )
            }
            console.log(
              'Colaborador carregado para edição:',
              $scope.selectedColaborador
            )
            $('#editColaboradorModal').modal('show')
          })
          .catch(function (error) {
            console.error('Erro ao carregar dados do colaborador:', error)
          })
      }

      $scope.salvarEdicao = function () {
        var dataFormatada = $filter('date')(
          $scope.selectedColaborador.dataAdmissao,
          'dd/MM/yyyy'
        )

        var dadosParaAtualizacao = {
          id: $scope.selectedColaborador.id,
          nome: $scope.selectedColaborador.nome,
          cpf: $scope.selectedColaborador.cpf,
          dataAdmissao: dataFormatada,
          remuneracao: $scope.selectedColaborador.remuneracao,
          cargo: { id: $scope.selectedColaborador.cargo.id },
        }

        ColaboradorService.editarColaborador(
          $scope.selectedColaborador.id,
          dadosParaAtualizacao
        )
          .then(function (data) {
            console.log('Colaborador atualizado com sucesso:', data)
            $('#editColaboradorModal').modal('hide')
            // Ignora o cache ao recarregar
            $scope.carregarColaboradores(
              $scope.currentPage,
              $scope.pageSize,
              true
            )
          })
          .catch(function (error) {
            console.error('Erro ao atualizar o colaborador:', error)
          })
      }

      $scope.avancarPagina = function () {
        if (
          !$scope.lastPageLoaded &&
          $scope.colaboradores.length === $scope.pageSize
        ) {
          $scope.currentPage++
          $scope.carregarColaboradores()
        }
      }

      $scope.retrocederPagina = function () {
        if ($scope.currentPage > 1) {
          $scope.currentPage--
          $scope.carregarOuPesquisarColaboradores()
        }
      }

      $scope.carregarOuPesquisarColaboradores = function () {
        if ($scope.searchTerm) {
          $scope.pesquisarColaboradores()
        } else {
          $scope.carregarColaboradores()
        }
      }

      $scope.confirmarExclusao = function (colaboradorId) {
        $('#deleteColaboradorModal').modal('show')
        ColaboradorService.deletarColaborador(colaboradorId).then(
          function (response) {
            $('#deleteColaboradorModal').modal('hide')
            $scope.totalColaboradores--
            $scope.lastPageLoaded = false
            if ($scope.totalColaboradores % $scope.pageSize === 0) {
              $scope.currentPage--
            }
            $scope.carregarColaboradores(
              $scope.currentPage,
              $scope.pageSize,
              true
            )
          },
          function (error) {
            console.error('Erro ao apagar o colaborador:', error)
          }
        )
      }

      $scope.apagarColaborador = function (colaborador) {
        $scope.selectedColaborador = colaborador
        $('#deleteColaboradorModal').modal('show')
      }

      $scope.carregarColaboradores()
    },
  ])
