const Koa = require('koa')
const app = new Koa()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(async ctx => {
  ctx.body =  'Hello world'
})

app.listen(process.env.APP_PORT)
