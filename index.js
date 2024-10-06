const express = require('express')
const morgan = require('morgan')

const app = express()

morgan.token('data', (request, response) =>{ 
    if (request.method === "POST") {
        return JSON.stringify(request.body)
    }
    return null
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.json())  // important in order to access request.body

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    const info = `<p>Phonebook has info for ${persons.length} people</p> <p>${new Date().toString()}</p>`
    response.send(info)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    console.log(persons)
    response.status(204).end()
})

const generateId = () => {
    const maxCapacity = 2000
    const minCapacity = 1
    let newId = Math.floor(Math.random() * (maxCapacity - minCapacity + 1)) + minCapacity;
    while (persons.some(person => person.id === newId)) {
        newId = Math.floor(Math.random() * (maxCapacity - minCapacity + 1)) + minCapacity
    }
    return String(newId)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ 
            error: 'name is missing' 
        })
    } else if (persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())){
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
            error: 'number is missing' 
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})