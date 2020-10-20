// Import dependencies
import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'
import mongoMessages from './messageModel.js'

// App conifg
const app = express()
const PORT = process.env.PORT || 9000

const pusher = new Pusher({
    appId: '1093451',
    key: '421b7a2b91442e23988b',
    secret: '0bc06170e7d10a912739',
    cluster: 'ap1',
    useTLS: true
  });

// Middlewares
app.use(express.json())
app.use(cors())

// DB config
const mongoURI = 'mongodb+srv://berenb:fIZ5h0wAVD9KMcgo@Cluster0.sjvuv.mongodb.net/messenger_clone?retryWrites=true&w=majority'
mongoose.connect(mongoURI), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connection.once('open', () => {
    console.log('DB CONNECTED')

    const changeStream = mongoose.connection.collection('messages').watch()
    changeStream.on('change', (change) => {
        pusher.trigger('messages', 'newMessage', {
            change: change
        });
    })
})

// API routes
app.get('/', (req, res) => res.status(200).send('Hello world'))

app.post('/save/message', (req, res) => {
    const dbMessage = req.body
    

    mongoMessages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/retrieve/conversation', (req, res) => {
    mongoMessages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            data.sort((b, a) => {
                return a.timestamp - b.timestamp;
            })
            res.status(201).send(data)
        }
    })
})

// Listen
app.listen(PORT, () => console.log(`listening on port: ${PORT}`))