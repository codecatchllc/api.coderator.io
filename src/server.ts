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
import ACTIONS from './actions';

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

// const httpServer = createServer(app);


// //create a socket server
// const io = new Server(httpServer, {
//   cors: {
//     origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
//     credentials: true,
//   },
// });

// //listen for a connection
// io.on('connection', (socket) => {
//   console.log('a user connected');
//   //output all connected users
//   console.log(io.engine.clientsCount);

//   //listen for a message
//   socket.on('message', (message) => {
//     console.log('message: ' + message);
//     //emit the message to all connected clients
//     io.emit('message', message);
//   });

//   //listen for a disconnect
//   socket.on('disconnect', () => {
//     console.log('a user disconnected');
//   });
// });

const server = createServer(app);

const io = new Server(server);

const userSocketMap = {};
function getAllConnectedClients(roomId: string) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id, roomId] = username;
        console.log(socket.id, 'joined', roomId);
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.JOIN, ({ socketId, username }) => {
        io.to(socketId).emit(ACTIONS.JOIN, { username });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        //socket.leave();
    });
});

const socketPort = 5001
server.listen(socketPort, () => {
  console.log(`Listening on port ${socketPort}`);
});

export default app;
