module.exports = (app) => {
    app.use('/user', require('./user'));
    app.use('/app', require('./application'));
    // app.use('/test', require('./test'));
};
