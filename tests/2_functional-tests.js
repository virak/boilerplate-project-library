/* globals suite, test */

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function (done) {
  //   chai.request(server)
  //     .get('/api/books')
  //     .end((err, res) => {
  //       assert.equal(res.status, 200)
  //       assert.isArray(res.body, 'response should be an array')
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
  //       assert.property(res.body[0], 'title', 'Books in array should contain title')
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id')
  //       done()
  //     }
  //     )
  // })
  /*
  * ----[END of EXAMPLE TEST]----
  */

  let validIdForTest = false

  suite('Routing tests', function () {
    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        const data = { title: 'my title' }
        chai
          .request(server)
          .post('/api/books')
          .send(data)
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.body.title, data.title)
            done()
          })
      })

      test('Test POST /api/books with no title given', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing required field title')
            done()
          })
      })
    })

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            if (err) console.log(err)
            assert.equal(res.status, 200)
            assert.isArray(res.body, 'response should be an array')
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount')
            assert.property(res.body[0], 'title', 'Books in array should contain title')
            assert.property(res.body[0], '_id', 'Books in array should contain _id')
            validIdForTest = res.body[0]._id
            done()
          }
          )
      })
    })

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/should-not-find-this')
          .end((err, res) => {
            if (err) console.log(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          }
          )
      })

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get('/api/books/' + validIdForTest)
          .end((err, res) => {
            if (err) console.log(err)
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments', 'Books in array should contain comments')
            assert.property(res.body, 'title', 'Books in array should contain title')
            assert.property(res.body, '_id', 'Books in array should contain _id')
            done()
          }
          )
      })
    })

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai
          .request(server)
          .post('/api/books/' + validIdForTest)
          .send({ comment: 'hello test' })
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments', 'Books in array should contain comments')
            assert.property(res.body, 'title', 'Books in array should contain title')
            assert.property(res.body, '_id', 'Books in array should contain _id')
            assert.isTrue(res.body.comments.includes('hello test'), 'comments contains new comment')
            done()
          })
      })

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai
          .request(server)
          .post('/api/books/' + validIdForTest)
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing required field comment')
            done()
          })
      })

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai
          .request(server)
          .post('/api/books/fdqfdqfdqsgdsq')
          .send({ comment: 'hello test' })
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      })
    })

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .delete('/api/books/' + validIdForTest)
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'delete successful')
            done()
          })
      })

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai
          .request(server)
          .delete('/api/books/fjhdjsqkhfjdskqlfdhskqj')
          .end(function (err, res) {
            if (err) console.error(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done()
          })
      })
    })
  })
})
