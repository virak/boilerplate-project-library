'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

// -- Schema definition
const bookSchema = new Schema({
  title: String,
  comments: [String]
})

const bookModel = mongoose.model('Book', bookSchema)

module.exports = function (app) {
  app.route('/api/books')
    .get(function (req, res) {
      bookModel.find({}, function (err, data) {
        if (err) console.error(err)
        if (typeof data !== 'undefined') {
          const returndata = data.map((element) => {
            return {
              title: element.title,
              _id: element._id,
              commentcount: element.comments.length
            }
          })
          res.json(returndata)
        } else {
          res.send('no book exists')
        }
      })
    })

    .post(function (req, res) {
      if (typeof req.body.title === 'undefined') {
        res.send('missing required field title')
      } else {
        const title = req.body.title
        const dataCreation = {
          title
        }
        bookModel.create(dataCreation, function (err, data) {
          if (err) console.log(err)
          const returnData = {
            title: data.title,
            _id: data._id
          }
          res.json(returnData)
        })
      }
    })

    .delete(function (req, res) {
      bookModel.deleteMany({}, function (err, data) {
        if (err) console.error(err)
        res.send('complete delete successful')
      })
    })

  app.route('/api/books/:id')
    .get(function (req, res) {
      bookModel.findById(req.params.id, function (err, book) {
        if (err) console.error(err)
        if (book !== null) {
          const returnData = {
            _id: book._id,
            title: book.title,
            comments: book.comments
          }
          res.json(returnData)
        } else {
          res.send('no book exists')
        }
      })
    })

    .post(function (req, res) {
      const bookid = req.params.id
      const comment = req.body.comment

      if (typeof comment === 'undefined' || comment === '') {
        res.send('missing required field comment')
      } else {
        bookModel.findById(bookid, function (err, book) {
          if (err) console.error(err)

          if (typeof book === 'undefined' || book === null) {
            res.send('no book exists')
          } else {
            book.comments.push(comment)
            book.save(function (err) {
              if (err) console.error(err)
              res.json({
                _id: book._id,
                title: book.title,
                comments: book.comments
              })
            })
          }
        })
      }
    })

    .delete(function (req, res) {
      const bookid = req.params.id
      bookModel.deleteOne({ _id: bookid }, function (err, data) {
        if (err) console.error(err)

        if (data.deletedCount === 1) {
          res.send('delete successful')
        } else {
          res.send('no book exists')
        }
      })
    })
}
