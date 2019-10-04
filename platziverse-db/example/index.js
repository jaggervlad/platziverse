'use strict'

const db = require('../')

async function run () {
    const config = {
        database: process.env.DB_NAME || 'platziverse',
        username: process.env.DB_USER || 'platzi',
        password: process.env.DB_PASS || 'platzi',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
    }

    const { Agent, Metric } = await db(config).catch(handlerFatalError)

    const agent = await Agent.createOrUpdate({
        uuid: 'yyy',
        name: 'test',
        username: 'test',
        hostname: 'test',
        pid: 0,
        connected: true
    }).catch(handlerFatalError)

    console.log('--agent--')
    console.log(agent)

    const agents = await Agent.findAll().catch(handlerFatalError)
    console.log('--agents--')
    console.log(agents)

    const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handlerFatalError)
    console.log('--metrics--')
    console.log(metrics)

    const metric = await Metric.create(agent.uuid, {
        type: 'memory',
        value: '300'
    }).catch(handlerFatalError)
    console.log('--metric--')
    console.log(metric)

    const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handlerFatalError)
    console.log('--metrics--')
    console.log(metricsByType)
}

function handlerFatalError(err) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)

}

run()