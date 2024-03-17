function isAuthenticated(req, res, next) {

    const excludedRoutes = ['/login', '/create-post', '/user-posts'];

    if (excludedRoutes.includes(req.path) || req.isAuthenticated()) {
        console.log('user is authenticated or accessing excluded route:', req.user);
        return next();
    }
    console.log('user is not authorized. redirecting to /login');
    res.redirect('/login');
}

module.exports = isAuthenticated;