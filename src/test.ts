import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import config from './utils/config';
import WebSocket from './controllers/socket'
import Server from 'socket.io'

const app: express.Application = express();
const io = Server(server, {
    cors: {
        origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
        credentials: true,
    }
})

io.on('connection', (socket) => {
  const webSocket = new WebSocket(socket, prisma)
  const userId = socket.handshake.query.userId
  webSocket.joinSession(userId)
  
  socket.on('disconnect', (reason) => webSocket.leaveSession(reason, userId))
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.listen(config.PORT, () => {
    console.log(`Listening on port ${config.PORT}`);
});