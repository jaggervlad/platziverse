'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

const config = {
  logging () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const id = 1
const uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null
// Obtenemos un unico agente para poder hacer las pruebas
const single = Object.assign({}, agentFixtures.single)
// Condicion  para obt a un agent por uuid
const uuidArgs = {
  where: {
    uuid
  }
}
const usernameArgs = {
  where: { username: 'platzi', connected: true }
}
const connectedArgs = {
  where: { connected: true }
}
const newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  // Modelo hasMany() ORM sequelize
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Modelo create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Modelo update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Modelo findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // Modelo findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Modelo findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  // Requerir los modelos con parametros por default
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exists')
})

// Tests para saber que los modelos estab bien relacionados en la DataBase
test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

// Test para saber si el modelo Agent tiene el metodo findById
test.serial('Agent#findById', async t => {
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called whit specifie id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

// Test para saber si el modelo Agent tiene el metodo findByUuid
test.serial('Agent#findByUuid', async t => {
  const agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findById should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

// Test para saber si el modelo Agent tiene el metodo findAll
test.serial('Agent#findAll', async t => {
  const agent = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called with uuid args')

  t.deepEqual(agent, agentFixtures.all, 'agents should be the same')
})

// Test para saber si el modelo Agent tiene el metodo findConnected
test.serial('Agent#findConnected', async t => {
  const agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

// Test para saber si el modelo Agent tiene el metodo findbyUsername
test.serial('Agent#findByUsername', async t => {
  const agents = await db.Agent.findByUsername('platzi')

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args')

  t.is(agents.length, agentFixtures.platzi.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
})

// Test para saber si el modelo Agent tiene el metodo createOrUpdate() cuando este existe
test.serial('Agent#createOrUpdate where - exists', async t => {
  const agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called the model')
  t.true(AgentStub.findOne.calledTwice, 'should be called twice')
  t.true(AgentStub.update.calledOnce, 'should be called once')
  t.deepEqual(agent, single, 'agent should be the same')
})

// Test para saber si el modelo Agent tiene el metodo createOrUpdate() cuando es nuevo
test.serial('Agent#createOrUpdate where - new', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne should be called with uuid args')
  t.true(AgentStub.create.called, 'should be called on model')
  t.true(AgentStub.create.calledOnce, 'should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called')

  t.deepEqual(agent, newAgent, 'agent should be the same')
})
