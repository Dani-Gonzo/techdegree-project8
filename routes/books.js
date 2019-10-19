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

// GET home page
router.get("/", (req, res, next) => {
    res.redirect("/books")
});

// GET books list
router.get("/books", handler(async (req, res) => {
    const books = await Book.findAll({order: [["title", "ASC"]]});
    res.render("index", {books, title: "Library Database"});
}));

// Add new book form
router.get("/new", (req, res) => {
    res.render("new-book", {book: {}, title: "New Book"});
});

// POST new book
router.post("/", handler(async (req, res) => {
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

// GET individual book detail
router.get("/:id", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("detail", {book, titke: book.title});
    } else {
        res.sendStatus(404);
    }
}));

// Update book info form
router.get("/:id/edit", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("update-book", {book, title: "Edit Book Information"});
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
            res.render("update-book", {book, errors: err.errors, title: "Edit Book Information"});
        } else {
            throw err;
        }
    }
}));

// Delete book form
router.get("/:id/delete", handler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("delete", {book, title: "Delete Book"});
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