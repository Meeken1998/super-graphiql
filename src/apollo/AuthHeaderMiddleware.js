export default function (req, next) {
  if (!req.options.headers) {
    req.options.headers = {}
  }

  const token = localStorage.getItem('token')
  req.options.headers.authorization = token ? `Bearer ${token}` : null
  next()
}
