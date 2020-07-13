const mongodb = require('mongodb')

const connectionString = 'mongodb+srv://toDoAppUser:todoappuser@cluster0.fcwxa.mongodb.net/shareM?retryWrites=true&w=majority'

mongodb.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('error connecting to db')
  } else {
    module.exports = client.db()
    const app = require('./app')
    app.listen(3000, () => {
      console.log('listening on port 3000')
    })
  }
})
