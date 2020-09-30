const { sanitizeEntity } = require('strapi-utils')

module.exports = {
  async getProductsForValidation (ctx) {
    const watches = await strapi.query('watches').find({ _limit: -1 })
    const slimWatches = watches.map(({ id, brand, model, refCode, price }) => {
      return {
        id,
        brand,
        model,
        refCode,
        price
      }
    })
    ctx.body = { products: slimWatches }
  },

  async getByRefCode (ctx) {
    const { refCode } = ctx.params

    const entity = await strapi.services.watches.findOne({ refCode })
    return sanitizeEntity(entity, { model: strapi.models.watches })
  }
}
