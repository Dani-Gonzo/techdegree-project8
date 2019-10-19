const express = require("express");
const router = express.Router();
const Book = require("../models").Book;

// Handler function
function handler(request) {
    return async (req, res, next) => {
        try {
            await request (req, res, next)
        } catch (err) {
            res.status(500).send(err);
        }
    }
}

// GET books list
router.get("/", handler(async (req, res) => {
    const books = await Book.findAll({order: [["title", "ASC"]]});
    res.render("books/index", {books, title: "Library Database"});
}));

// Add new book form
router.get("/new", (req, res) => {
    res.render("books/new", {book: {}, title: "New Book"});
});

// POST new book
router.post("/", handler(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect("/books/" + book.id);
    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            book = await Book.buidl(req.body);
            res.render("books/new", {book, errors: err.errors, title: "New Book"});
        } else {
            throw err;
        }
    }
}));

// GET individual book detail
router.get("/:id", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("books/show", {book, titke: book.title});
    } else {
        res.sendStatus(404);
    }
}));

// Update book info form
router.get("/:id/edit", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("books/edit", {book, title: "Edit Book Information"});
    } else {
        res.sendStatus(404);
    }
}));

// POST new book info
router.post("/:id/edit", handler(async (req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.redirect("/books/" + book.id);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render("books/edit", {book, errors: err.errors, title: "Edit Book Information"});
        } else {
            throw err;
        }
    }
}));

// Delete book form
router.get("/:id/delete", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("/books/delete", {book, title: "Delete Book"});
    } else {
        res.sendStatus(404);
    }
}));

// POST book deletion
router.post("/:id/delete", handler (async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        await book.destroy();
        res.redirect("/books");
    } else {
        res.sendStatus(404);
    }
}));

module.exports = router;