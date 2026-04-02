module.exports = function (req, res, next) {
  // TEMP AUTH (for testing)
  req.userId = "demo-user"
  req.userRole = "user"
  next()
}
