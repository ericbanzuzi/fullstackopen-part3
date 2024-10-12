require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length > 4) {
  console.log('only name and number should be given as argument')
  process.exit(1)
}

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 2){
  console.log('phonebook:')
  Person
    .find({})
    .then(persons => {
      persons.forEach(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })
} else {

  const name = process.argv[2]
  const number = process.argv[3]

  const person = new Person({
    name: name,
    number: number || 'None',
  })

  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
