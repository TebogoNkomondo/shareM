const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

let port = process.env.PORT
if (port == null || '') {
  port = process.env.PORT
}

mongodb.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('error connecting to db')
  } else {
    module.exports = client
    const app = require('./app')
    app.listen(port, () => {
      console.log('listening on port 3000')
    })
  }
})
