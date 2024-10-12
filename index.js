const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('data', (request, response) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  }
  return null
})

app.use(express.static('dist'))
app.use(express.json())  // important in order to access request.body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())


app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const info = `<p>Phonebook has info for ${count} people</p> <p>${new Date().toString()}</p>`
    response.send(info)
  })
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.send(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }}).catch(error => { next(error) })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(404).end()
  }).catch(error => next(error))
})

// used prior to MongoDB connection
// const generateId = () => {
//   const maxCapacity = 2000
//   const minCapacity = 1
//   let newId = Math.floor(Math.random() * (maxCapacity - minCapacity + 1)) + minCapacity;
//   while (persons.some(person => person.id === newId)) {
//     newId = Math.floor(Math.random() * (maxCapacity - minCapacity + 1)) + minCapacity
//   }
//   return String(newId)
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' })
  } else if (!body.number) {
    return response.status(400).json({ error: 'number is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(() => {
    response.json(person)
  }).catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})