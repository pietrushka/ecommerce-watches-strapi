const { sanitizeEntity } = require('strapi-utils')

module.exports = {
  async getProductsForValidation (ctx) {
    const watches = await strapi.query('watches').find({ _limit: -1 })
    const slimWatches = watches.map(({ id, brand, model, refCode, price, cover, images }) => {
      return {
        id,
        brand,
        model,
        refCode,
        cover,
        images,
        price
      }
    })
    ctx.body = { products: slimWatches }
  }
}
