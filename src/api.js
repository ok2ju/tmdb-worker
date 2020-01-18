const axios = require('axios')

const AxiosInstance = axios.create({
  baseURL: process.env.TMDB_BASE_URL
})

AxiosInstance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

const requestMovies = (page) => (
  AxiosInstance.get('/discover/movie', {
    params: {
      api_key: process.env.TMDB_API_KEY,
      sort_by: 'popularity.desc',
      page
    }
  })
)

module.exports = {
  AxiosInstance,
  requestMovies
}
