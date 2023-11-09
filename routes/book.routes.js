const express = require("express");
const { BookModel } = require("../models/book.model");
const { auth } = require("../middlewares/auth.middleware");
const bookRouter = express.Router();

bookRouter.get("/", async (req, res) => {
  const { page = 1, limit = 2, title, author } = req.query;
  try {
    const query = {};
    if (title) {
      query.Title = { $regex: new RegExp(title, "i") };
    }
    if (author) {
      query.Author = { $regex: new RegExp(author, "i") };
    }

    const skip = (page - 1) * limit;
    const books = await BookModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalBooks = await BookModel.countDocuments(query);

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalBooks / limit),
      books,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({ error });
  }
});

bookRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await BookModel.findById({ _id: id });
    if (!book) {
      res.status(404).json({ msg: `Book with ${id} not available` });
    } else {
      res.status(200).json({ book });
    }
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({ error });
  }
});

bookRouter.post("/add", auth, async (req, res) => {
  const payload = req.body;
  try {
    const book = new BookModel(payload);
    await book.save();
    res.status(201).json({ msg: "Book added to store", book });
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({ error });
  }
});

bookRouter.put("/update/:id", auth, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const book = BookModel.findById({ _id: id });
    if (!book) {
      res.status(404).json({ msg: `Book with ${id} is not available` });
      return;
    }
    const { Title, Author, ISBN, Description, PublishedDate } = payload;
    if (Title && Author && ISBN && Description && PublishedDate) {
      await BookModel.findByIdAndUpdate({ _id: id }, payload);
      res.status(200).json({ msg: `Book with ${id} updated in the Store` });
    } else {
      res
        .status(400)
        .json({ msg: `Please give all the data to update the book` });
    }
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({ error });
  }
});

bookRouter.delete("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findById({ _id: id });
    if (!book) {
      res.status(404).json({ msg: `Book with ${id} not available` });
    } else {
      await BookModel.findByIdAndDelete({ _id: id });
      res.status(200).json({ msg: `Book with ${id} has been deleted!` });
    }
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({ error });
  }
});

module.exports = { bookRouter };
