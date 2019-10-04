'use strict'

module.exports = function setUpMetric (MetrictModel, AgentModel) {
  async function findByAgentUuid (uuid) {
    return MetrictModel.findAll({
      attributes: ['type'],
      group: ['type'],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetrictModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type
      },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }
  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid }
    })

    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      const result = await MetrictModel.create(metric)
      return result.toJSON()
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
