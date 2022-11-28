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
import axios from 'axios';

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
            // console.log("RETURNING:");
            // console.log("SOCKETID: ", socketId);
            // console.log("USERNAME: ", userSocketMap[socketId].username);
            return {
                socketId,
                username: userSocketMap[socketId].username,
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, (roomId, username) => {
        userSocketMap[socket.id] = { username, roomId };
        // console.log('User: ', username, ' with socket ', socket.id, 'joined', roomId);
        console.log("Socket Map: ", userSocketMap);

        // Joining the room
        socket.join(roomId);

        // Getting all the clients in the room
        const clients = getAllConnectedClients(roomId);
        console.log("Clients: ", clients);

        io.to(roomId).emit(ACTIONS.JOINED,
            clients,
            { user: username },
            { socketId: socket.id }
        );
    });

    socket.on(ACTIONS.CODE_CHANGE, (roomId, code) => {

        io.to(roomId).emit(ACTIONS.CODE_CHANGE, code);
        console.log(code, " ", roomId);

        const content = code;

        axios.
            post(`http://localhost:5000/api/v1/auth/session/${roomId}/save`, {
                content,
            })
            .then((res) => {
                console.log("Saved code to database");
                console.log(res.data);
            }
            )
            .catch((err) => {
                console.log(err);
            });
    });

    socket.once(ACTIONS.SYNC_CODE, (code, roomId) => {
        io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        console.log("Syncing: ", code, "to room: ", roomId);
    });

    socket.on(ACTIONS.JOIN, ({ socketId, username }) => {
        io.to(socketId).emit(ACTIONS.JOIN, { username });
    });

    socket.once('disconnect', () => {
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

    return () => {
        socket.removeAllListeners();
    }
});

const socketPort = 5001
server.listen(socketPort, () => {
    console.log(`Listening on port ${socketPort}`);
});

export default app;
