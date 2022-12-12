const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const async = require("async");

// express-validator for Forms
const { body, validationResult } = require("express-validator");
const author = require("../models/author");

// Display list of all BookInstance
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec(function (err, list_bookinstance) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstance,
      });
    });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance === null) {
        // No results.
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("bookinstance_detail", {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance,
      });
    });
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = (req, res) => {
  Book.find({}, "title").exec((err, books) => {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};

// Handle BookInstance create form on POST
exports.bookinstance_create_post = [
  // validate and sanitize fields
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req);
    // Create a BookInstance object with esacped and trimmed date
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      Book.find({}, "title").exec(function (err, book) {
        if (err) {
          return next(err);
        }
        // Successful, so render
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance,
        });
      });
      return;
    }
    // Data from form is valid
    bookinstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.redirect(bookinstance.url);
    });
  },
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = (req, res) => {
  res.render("bookinstance_delete.pug", { title: "Delete Book Instance" });
};

// Handle BookInstance delete form on POST
exports.bookinstance_delete_post = (req, res) => {
  // get bookinstance document from database
  BookInstance.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return next(err);
    }
    // successful, go to book instance list
    res.redirect("/catalog/bookinstances");
  });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle BookInstance update form on POST
exports.bookinstance_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};
