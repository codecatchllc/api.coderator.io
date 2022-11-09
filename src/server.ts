import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes';
import config from './utils/config';
import { Server } from 'socket.io';
import { createServer } from 'http';
const app: express.Application = express();

app.enable('json spaces');
app.enable('strict routing');
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
    credentials: true,
  })
);
app.use(express.json());
app.set('trust proxy', config.NODE_ENV === 'production' ? 1 : 0);
app.use(routes);

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});

const httpServer = createServer(app);


//create a socket server
const io = new Server(httpServer, {
  cors: {
    origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
    credentials: true,
  },
});

//listen for a connection
io.on('connection', (socket) => {
  console.log('a user connected');
  //output all connected users
  console.log(io.engine.clientsCount);

  //listen for a message
  socket.on('message', (message) => {
    console.log('message: ' + message);
    //emit the message to all connected clients
    io.emit('message', message);
  });

  //listen for a disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

const socketPort = 5001
httpServer.listen(socketPort, () => {
  console.log(`Listening on port ${socketPort}`);
});


export default app;
