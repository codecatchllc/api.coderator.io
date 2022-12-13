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

// ---- Socket Server for Session Syncronization ----
const conId = {};
const colors = [
    '#9555c8', // Purple: Good occupancy need to turn down
    '#611700', // Red: Good
    '#453832', // Brown: Good
    '#29285f', // Dark Blue: Good
];
const users = {};

const io = new Server(server, {
    cors: {
        origin: `${config.PROTOCOL}://${config.CLIENT_URL}`,
        credentials: true,
    }
});

function getAllConnectedClients(roomId: string) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            // console.log("RETURNING:");
            // console.log("SOCKETID: ", socketId);
            // console.log("USERNAME: ", userSocketMap[socketId].username);
            return {
                socketId,
                username: users[socketId].user,
            };
        }
    );
}

function checkCurrentClinets(roomId, username, sock){
    let bool = false;
    // return the old socket to disconnect 
    const sockArr = Array.from(io.sockets.adapter.rooms.get(roomId) || [])

    sockArr.forEach( (i) => {
        // console.log('comparing sock arr: ', i, ' to current: ', sock);
        if (i  != sock){
            // console.log('Comparing Username: ', username, ' ; ', users[i].user);
            if (username.toString() == users[i].user.toString()){
                // console.log('FOUND MATCHING USERNAMES');
                bool = users[i].user;
                return users[i].user;
            }
        }
    });

    return bool;
}

function checkDuplicateClinets(roomId, username, sock){
    let bool = 0;
    // return number of occurances of username
    const sockArr = Array.from(io.sockets.adapter.rooms.get(roomId) || [])

    sockArr.forEach( (i) => {
        // console.log('comparing sock arr: ', i, ' to current: ', sock);
        if (i  != sock){
            // console.log('Comparing Username: ', username, ' ; ', users[i].user);
            if (username.toString() == users[i].user.toString()){
                // console.log('FOUND MATCHING USERNAMES');
                bool++;
            }
        }
    });

    return bool;
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, (roomId, username) => {
        // Checking if the user is already in room 
        const check = checkCurrentClinets(roomId, username, socket.id);
        if (check){
            socket.broadcast.to(roomId).emit(ACTIONS.EXIT, {
                user: username,
            });
            delete users[socket.id];
        }


        // Creating the user
        console.log('ACTIONS.JOIN: User: ', username, ' with socket ', socket.id, 'joined', roomId);
        // console.log("Socket Map: ", userSocketMap);

        // Setting up local data for user
        if (!conId[roomId]){
            conId[roomId] = {currentUsers: 1};
        } else{
            conId[roomId].currentUsers++;
        }
        users[socket.id] = {};
        users[socket.id].user = username;
        users[socket.id].color= colors[Math.abs(conId[roomId].currentUsers % colors.length)];
        users[socket.id].room = roomId;

        // Joining the room
        socket.join(roomId);

        // Getting all the clients in the room
        const clients = getAllConnectedClients(roomId);
        console.log("Clients: ", clients);

        // Emitting user data
        socket.broadcast.to(roomId).emit(ACTIONS.CONNECTED, {user : users[socket.id].user, color : users[socket.id].color});
        io.to(roomId).emit(ACTIONS.USERDATA, Object.values(users));

        io.to(roomId).emit(ACTIONS.JOINED,
            clients,
            { user: username },
            { socketId: socket.id }
        );
    });

    socket.on(ACTIONS.CODE_CHANGE, (roomId, code, rawValue) => {
        socket.broadcast.to(roomId).emit(ACTIONS.CODE_CHANGE, code);
            
        axios.
            post(`${process.env.API_URL}/auth/session/${roomId}/save`, {
                rawValue,
            })
            .then((res) => {
                if(res) {
                    console.log("Saved code to database");
                }
            })
            .catch((err) => {
                console.log(err);
            });

    });

    socket.on(ACTIONS.SELECTION, function (data) {       //Content Select Or Cursor Change Event
            data.color = users[socket.id].color
            data.user = users[socket.id].user
            // console.log('Cursor ', data.user, ' has moved.');
            socket.broadcast.to(users[socket.id].room).emit(ACTIONS.SELECTION, data) 
    }); 

    socket.on('disconnect', () => {
        if (users[socket.id]){
            const username = users[socket.id].user;
            console.log('User Disconnected: ', users[socket.id].user);
            const roomId = users[socket.id].room;
            
            // Checking for duplicate users in room
            const userCount = checkDuplicateClinets(roomId, username, socket.id);
            if (userCount == 0){
                conId[roomId].currentUsers--;
                socket.broadcast.to(roomId).emit(ACTIONS.EXIT, {
                    socketId: socket.id,
                    user: users[socket.id].user,
            });
            }
    
        delete users[socket.id];
        //socket.leave();
        }
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
