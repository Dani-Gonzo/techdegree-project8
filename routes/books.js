const express = require("express");
const router = express.Router();
const {Book} = require("../models");
const Op = require("sequelize").Op;
// For limiting number of records displayed at a time
const pageLimit = 5;

// Server error handler 
function handler(request) {
    return async (req, res, next) => {
        try {
            await request (req, res, next)
        } catch (err) {
            console.log(err);
            res.status(500).render("error");
        }
    }
}

// 404 error handler
function notFoundHandler(next) {
    const err = new Error("Not Found");
    err.status = 404;
    // Logs error to the console
    console.log("Sorry, we couldn't find the webpage you were looking for :( Error code:", err.status);
    next(err);
}

// GET books list
router.get("/", handler(async (req, res) => {
    // Count records in database dynamically
    const bookCount = await Book.count();
    // If page request is undefined, default to 1
    const currentPage = req.query.page === undefined ? 1 : req.query.page;
    // Make currentPage 0-based so first set of records isn't skipped
    const recordOffset = (currentPage - 1) * pageLimit;
    // Make sure a page and button is displayed for partially-filled pages
    const pageCount = Math.ceil(bookCount / pageLimit);
    const books = await Book.findAll({offset: recordOffset, limit: pageLimit, order: [["title", "ASC"]]});
    res.render("index", {books, title: "Library Database", pagePath: "", query: "", pageCount, currentPage});
}));

// Add new book form
router.get("/new", (req, res) => {
    res.render("new-book", {book: {}, title: "New Book"});
});

// POST new book
router.post("/new", handler(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect("/books/" + book.id);
    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            res.render("new-book", {book, errors: err.errors, title: "New Book"});
        } else {
            throw err;
        }
    }
}));

// Search route
router.get("/search", handler(async (req, res) => {
    const query = {
        [Op.or]: [
            {
                title: {
                    [Op.like]: `%${req.query.search}%`
                }
            },
            {
                author: {
                    [Op.like]: `%${req.query.search}%`
                }
            },
            {
                genre: {
                    [Op.like]: `%${req.query.search}%`
                }
            },
            {
                year: {
                    [Op.like]: `%${req.query.search}%`
                }
            }
        ]
    };
    const bookCount = await Book.count({where: query});
    const currentPage = req.query.page === undefined ? 1 : req.query.page;
    const recordOffset = (currentPage - 1) * pageLimit;
    const pageCount = Math.ceil(bookCount / pageLimit);
    const books = await Book.findAll({where: query, offset: recordOffset, limit: pageLimit, order: [["title", "ASC"]]});
    res.render("index", {books, title: "Search Query", pagePath: "search", query: "&search=" + req.query.search, pageCount, currentPage});
}));

// GET individual book detail
router.get("/:id", handler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("book-detail", {book, title: book.title});
    } else {
        notFoundHandler(next);
    }
}));

// Update book info form
router.get("/:id/edit", handler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("update-book", {book, title: "Edit Book Information"});
    } else {
        notFoundHandler(next);
    }
}));

// POST new book info
router.post("/:id/edit", handler(async (req, res, next) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.redirect(`/books/${book.id}`);
        } else {
            notFoundHandler(next);
        }
    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render("update-book", {book, errors: err.errors, title: "Edit Book Information"});
        } else {
            throw err;
        }
    }
}));

// Delete book form
router.get("/:id/delete", handler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("delete", {book, title: "Delete Book"});
    } else {
        notFoundHandler(next);
    }
}));

// POST book deletion
router.post("/:id/delete", handler (async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        await book.destroy();
        res.redirect("/books");
    } else {
        notFoundHandler(next);
    }
}));

module.exports = {
    router,
    notFoundHandler
}