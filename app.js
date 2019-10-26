const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const books = require('./routes/books');

const app = express();

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/books', books.router);

// ERROR HANDLING
// Non-existent path request creates a 404 error
app.use((req, res, next) => {
    books.notFoundHandler(next);
});

app.use((err, req, res, next) => {
    res.locals.error = err;
    if (err.status) {
        res.status(err.status);
    }
    // Uses custom error template for user-friendly error display
    res.render("page-not-found");
});

app.listen(3000, () => console.log('App listening on port 3000!'));

module.exports = app;