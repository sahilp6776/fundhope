module.exports = function (req, res, next) {
  // TEMP AUTH (to avoid crash)
  req.userId = "demo-user"
  req.userRole = "user"
  next()
}
