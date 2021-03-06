const _ = require('lodash')
const { sanitizeEntity } = require('strapi-utils')

const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] }
]

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model
  })

module.exports = {
  async me (ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }])
    }

    const { id, username, email } = user

    const slimUser = { id, username, email }

    ctx.body = sanitizeUser(slimUser)
  },

  async updateMe (ctx) {
    const advancedConfigs = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced'
      })
      .get()

    const { id } = ctx.state.user
    const { email, username, password } = ctx.request.body

    const user = await strapi.plugins['users-permissions'].services.user.fetch({
      id
    })

    if (_.has(ctx.request.body, 'email') && !email) {
      return ctx.badRequest('email.notNull')
    }

    if (_.has(ctx.request.body, 'username') && !username) {
      return ctx.badRequest('username.notNull')
    }

    if (_.has(ctx.request.body, 'password') && !password && user.provider === 'local') {
      return ctx.badRequest('password.notNull')
    }

    if (_.has(ctx.request.body, 'username')) {
      const userWithSameUsername = await strapi
        .query('user', 'users-permissions')
        .findOne({ username })

      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.username.taken',
            message: 'username.alreadyTaken.',
            field: ['username']
          })
        )
      }
    }

    if (_.has(ctx.request.body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi.query('user', 'users-permissions').findOne({ email: email.toLowerCase() })

      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.taken',
            message: 'Email already taken',
            field: ['email']
          })
        )
      }
      ctx.request.body.email = ctx.request.body.email.toLowerCase()
    }

    const updateData = {
      ...ctx.request.body
    }

    if (_.has(ctx.request.body, 'password') && password === user.password) {
      delete updateData.password
    }

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData)

    ctx.send(sanitizeUser(data))
  },

  async getMyFavorites (ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }])
    }
    const slimUser = { favorites: user.favorites }

    ctx.body = sanitizeUser(slimUser)
  },

  async myPopulatedFavorites (ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }])
    }

    const id = user.id

    const fetchedUser = await strapi.plugins['users-permissions'].services.user.fetch({ id }, ['favorites'])

    if (!fetchedUser) {
      return ctx.notFound('User does not exist')
    }

    ctx.body = { favorites: fetchedUser.favorites }
  },

  async getMyCart (ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }])
    }
    const slimUser = { cart: user.cart }

    ctx.body = sanitizeUser(slimUser)
  },

  async getMyOrders (ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No authorization header was found' }] }])
    }

    const id = user.id

    const fetchedUser = await strapi.plugins['users-permissions'].services.user.fetch({ id }, ['orders'])

    if (!fetchedUser) {
      return ctx.notFound('User does not exist')
    }

    ctx.body = { orders: fetchedUser.orders }
  }
}
