// middleware/auth.js

module.exports = (req, res, next) => {
  console.log('Auth middleware running')

  // simple allow (for now)
  next()
}
