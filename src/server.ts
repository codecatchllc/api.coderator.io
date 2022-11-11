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


const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
        credentials: true,
    }
});

const userSocketMap = {};
function getAllConnectedClients(roomId: string) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId].username,
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ( roomId, username ) => {
        userSocketMap[socket.id] = { username, roomId };
        console.log('User: ', username, ' with socket ', socket.id, 'joined', roomId);
        console.log(userSocketMap);
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach((client) => {
            const socketId = client.socketId
            io.to(socketId).emit(ACTIONS.JOINED, 
                clients,
                {user: username},
                {socketID: socket.id},
            );
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ( roomId, code ) => {
        const clients = getAllConnectedClients(roomId);
        console.log("Clients: ", clients);  // FIND OUT WHY THERE IS NO CLIENTS IN LIST LIKE ABOVE
        clients.forEach((client) => {
            const socketId = client.socketId
            console.log("Socket ID: ", socketId);
            io.to(socketId).emit(ACTIONS.CODE_CHANGE,  code, );
        });
        console.log(code, " ", roomId);
    });

    socket.on(ACTIONS.SYNC_CODE, ( code, socketId ) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.JOIN, ({ socketId, username }) => {
        io.to(socketId).emit(ACTIONS.JOIN, { username });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
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
