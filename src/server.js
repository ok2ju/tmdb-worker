const http = require('http')
const mongoose = require('mongoose')
const { CronJob } = require('cron')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { Movie } = require('./models')
const { requestMovies } = require('./api')
const { delay } = require('./utils')

const server = http.createServer()

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const collectMovies = (results) => (
  results.reduce((res, curr) => [...res, ...curr.results], [])
)

const populateDB = async () => {
  try {
    const { page, total_pages } = await requestMovies()
    const promises = []

    for (let i = page; i <= total_pages; i++) {
      promises.push(requestMovies(i))
      await delay(50) // adds some time to result execution time 50ms = 0.05s, 0.05 * total_pages = additional time
    }

    const res = await Promise.all(promises)
    const movies = collectMovies(res)

    movies.forEach(async (movie) => {
      const targetMovie = await Movie.findOne({ id: movie.id })
      if (targetMovie) {
        Movie.replaceOne({ id: movie.id }, movie)
      } else {
        Movie.create(movie)
      }
    })
  } catch (error) {
    console.log('Populate DB error', error)
  }
}

const db = mongoose.connection
db.on('error', (error) => {
  console.error('connection error:', error)
})

db.once('open', () => {
  console.log('MongoDB connection established')

  // Run job every 30 minutes
  // new CronJob('0 */30 * * * *', () => {
  new CronJob('0 */01 * * * *', () => {
    console.log('Job started at', new Date())
    populateDB()
  }, null, true, 'Europe/Minsk')
})

server.listen(process.env.APP_PORT)
