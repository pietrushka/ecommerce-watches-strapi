const { sanitizeEntity } = require('strapi-utils')

module.exports = {
  async getByRefCode (ctx) {
    const { refCode } = ctx.params

    const entity = await strapi.services.watches.findOne({ refCode })
    return sanitizeEntity(entity, { model: strapi.models.watches })
  }
}
