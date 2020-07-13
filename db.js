const mongodb = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

mongodb.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('error connecting to db')
  } else {
    module.exports = client.db()
    const app = require('./app')
    app.listen(process.env.PORT, () => {
      console.log('listening on port 3000')
    })
  }
})
