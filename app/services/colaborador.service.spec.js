describe('Service: ColaboradorService', function () {
  var ColaboradorService, $httpBackend, $rootScope

  beforeEach(module('GerenciamentoColaboradores'))

  beforeEach(inject(function (
    _ColaboradorService_,
    _$httpBackend_,
    _$rootScope_
  ) {
    ColaboradorService = _ColaboradorService_
    $httpBackend = _$httpBackend_
    $rootScope = _$rootScope_
    $httpBackend.whenGET(/\.html$/).respond(200, '')
  }))

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  it('deve atualizar um colaborador', function () {
    var colaboradorAtualizado = {
      id: 'fae1',
      nome: 'Pedro Atualizado',
      cpf: '123.456.789-09',
      dataAdmissao: '20/02/2024',
      remuneracao: 2500,
      cargoId: '1',
    }
    $httpBackend
      .expectPUT(
        'http://localhost:3000/colaboradores/fae1',
        colaboradorAtualizado
      )
      .respond(200, colaboradorAtualizado)

    var response
    ColaboradorService.editarColaborador('fae1', colaboradorAtualizado).then(
      function (res) {
        response = res
      }
    )
    $httpBackend.flush()
    expect(response.nome).toEqual('Pedro Atualizado')
  })

  it('deve deletar um colaborador', function () {
    $httpBackend
      .expectDELETE('http://localhost:3000/colaboradores/fae1')
      .respond(204)

    var response = false
    ColaboradorService.deletarColaborador('fae1').then(function () {
      response = true
    })
    $httpBackend.flush()
    expect(response).toBe(true)
  })

  it('deve carregar os cargos', function () {
    var cargos = [
      { id: '1', descricao: 'Desenvolvedor' },
      { id: '2', descricao: 'Analista' },
    ]
    $httpBackend.expectGET('http://localhost:3000/cargos').respond(200, cargos)

    var response
    ColaboradorService.getCargos().then(function (res) {
      response = res
    })
    $httpBackend.flush()
    expect(response).toEqual(cargos)
  })

  it('deve criar um colaborador', function () {
    var colaboradorCriado = {
      id: 'fae1',
      nome: 'Pedro Mauricio',
      cpf: '123.456.789-09',
      dataAdmissao: '20/02/2024',
      remuneracao: 2500,
      cargoId: '1',
    }
    $httpBackend
      .expectPOST('http://localhost:3000/colaboradores', colaboradorCriado)
      .respond(201, colaboradorCriado)

    var response
    ColaboradorService.criarColaborador(colaboradorCriado).then(function (res) {
      response = res
    })
    $httpBackend.flush()
    expect(response.nome).toEqual('Pedro Mauricio')
  })

  it('deve listar colaboradores com paginação', function () {
    var colaboradores = [
      { id: 'fae1', nome: 'Pedro Mauricio', cargo: { id: '1' } },
      { id: 'fae2', nome: 'Maria Silva', cargo: { id: '2' } },
    ]
    var cargos = [
      { id: '1', descricao: 'GERENTE' },
      { id: '2', descricao: 'SUBORDINADO' },
    ]
    $httpBackend
      .expectGET('http://localhost:3000/colaboradores?_page=1&_per_page=2')
      .respond(200, colaboradores, {
        'X-Total-Count': '2',
        'X-Max-Per-Page': '2',
      })
    $httpBackend.expectGET('http://localhost:3000/cargos').respond(200, cargos)

    var response
    ColaboradorService.listarColaboradores(1, 2, false).then(function (res) {
      response = res
    })
    $httpBackend.flush()

    expect(response.colaboradores.length).toEqual(2)
    expect(response.total).toEqual(2)
    expect(response.colaboradores[0].nome).toEqual('Pedro Mauricio')
  })

  // Adicionando os novos testes solicitados
  // Novo teste: deve carregar um colaborador pelo ID
  it('deve carregar um colaborador pelo ID', function () {
    var colaborador = {
      id: 'fae1',
      nome: 'Pedro Mauricio',
      cpf: '123.456.789-09',
      dataAdmissao: '20/02/2024',
      remuneracao: 2000,
      cargo: { id: '1' },
    }
    var cargos = [
      { id: '1', descricao: 'GERENTE' },
      { id: '2', descricao: 'SUBORDINADO' },
    ]
    $httpBackend
      .expectGET('http://localhost:3000/colaboradores/fae1')
      .respond(200, colaborador)
    $httpBackend.expectGET('http://localhost:3000/cargos').respond(200, cargos)

    var response
    ColaboradorService.carregarColaborador('fae1').then(function (res) {
      response = res
    })
    $httpBackend.flush()

    expect(response.nome).toEqual('Pedro Mauricio')
    expect(response.cargo.id).toEqual('1')
  })

  // Novo teste: deve tratar erro ao carregar colaborador inexistente
  it('deve tratar erro ao carregar colaborador inexistente', function () {
    $httpBackend
      .expectGET('http://localhost:3000/colaboradores/fae99')
      .respond(404, 'Colaborador não encontrado')

    var response, errorResponse
    ColaboradorService.carregarColaborador('fae99').then(
      function (res) {
        response = res
      },
      function (error) {
        errorResponse = error
      }
    )
    $httpBackend.flush()

    expect(response).toBeUndefined()
    expect(errorResponse.status).toEqual(404)
  })

  // Novo teste: deve retornar os cargos do cache
  it('deve retornar os cargos do cache', function () {
    var cargos = [
      { id: '1', descricao: 'GERENTE' },
      { id: '2', descricao: 'SUBORDINADO' },
    ]
    $httpBackend.expectGET('http://localhost:3000/cargos').respond(200, cargos)

    var response1, response2
    ColaboradorService.getCargos().then(function (res) {
      response1 = res
    })
    $httpBackend.flush()
    $rootScope.$apply() // Garante que todas as promessas são resolvidas

    expect(response1).toEqual(cargos)

    // Segunda chamada deve usar o cache
    ColaboradorService.getCargos().then(function (res) {
      response2 = res
    })
    $rootScope.$apply() // Garante que todas as promessas são resolvidas

    expect(response2).toEqual(cargos)
  })
})
