const express = require("express");
const router = express.Router();
const {Book} = require("../models");
const Op = require("sequelize").Op;

// Handler function
function handler(request) {
    return async (req, res, next) => {
        try {
            await request (req, res, next)
        } catch (err) {
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
    const books = await Book.findAll({order: [["title", "ASC"]]});
    res.render("index", {books, title: "Library Database"});
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
    const books = await Book.findAll({where: {
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
    }});
    res.render("index", {books, title: "Search Query"});
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