function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'danger', message: 'Please login to continue.' };
    return res.redirect('/auth/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.flash = { type: 'danger', message: 'Admin access is required.' };
    return res.redirect('/');
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
