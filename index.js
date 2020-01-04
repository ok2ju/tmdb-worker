const Koa = require('koa')
const mongoose = require('mongoose')
const { CronJob } = require('cron')
const axios = require('axios')
const app = new Koa()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('connection established')
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

// new CronJob('* * * * * *', () => {
//   console.log('You will see this message every second');
// }, null, true, 'Europe/Minsk')

const getMovies = (page) => {
  let url = `${process.env.TMDB_BASE_URL}discover/movie?api_key=ab7c9fc53125a8e8d9fd23c8704f80e5&sort_by=popularity.desc`
  if (page) {
    url += `&page=${page}`
  }

  return axios.get(url)
}

const collectMovies = (results) => {
  return results.reduce((res, curr) => [...res, ...curr.data.results], [])
}

app.use(async ctx => {
  const { data } = await getMovies()
  const promises = []

  for (let i = data.page; i <= data.total_pages; i++) {
    promises.push(getMovies(i))
  }

  const res = await Promise.all(promises)
  const movies = collectMovies(res)
  Movie.create(movies, (err) => {
    if (err) console.log('error', err)
    console.log('saved')
  })

  ctx.body = 'Hello world'
})

app.listen(process.env.APP_PORT)
