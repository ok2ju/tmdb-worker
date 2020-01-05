const http = require('http')
const mongoose = require('mongoose')
const { CronJob } = require('cron')
const axios = require('axios')

const server = http.createServer()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const AxiosInstance = axios.create({
  baseURL: `${process.env.TMDB_BASE_URL}`
})

AxiosInstance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', (error) => {
  console.error('connection error:', error)
})

db.once('open', () => {
  console.log('MongoDB connection established')
})

const movieSchema = new mongoose.Schema({
  adult: Boolean,
  backdrop_path: String,
  budget: Number,
  genres: Array,
  homepage: String,
  id: Number,
  imdb_id: String,
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: String,
  production_companies: Array,
  production_countries: Array,
  release_date: String,
  revenue: Number,
  runtime: Number,
  spoken_languages: Array,
  status: String,
  tagline: String,
  title: String,
  video: Boolean,
  vote_average: Number,
  vote_count: Number
})

const Movie = mongoose.model('Movie', movieSchema)

const requestMovies = (page) => (
  AxiosInstance.get('/discover/movie', {
    params: {
      api_key: process.env.TMDB_API_KEY,
      sort_by: 'popularity.desc',
      page
    }
  })
)

const collectMovies = (results) => (
  results.reduce((res, curr) => [...res, ...curr.results], [])
)

const delay = (ms) => (
  new Promise(resolve => setTimeout(resolve, ms))
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
    Movie.create(movies, (err) => {
      if (err) console.log('error', err)
      console.log('saved')
    })
  } catch (error) {
    console.log('Populate DB error', error)
  }
}

// Run job every 30 minutes
// new CronJob('0 */30 * * * *', () => {
new CronJob('0 */01 * * * *', () => {
  console.log('Job started at', new Date())
  populateDB()
}, null, true, 'Europe/Minsk')

server.listen(process.env.APP_PORT)
