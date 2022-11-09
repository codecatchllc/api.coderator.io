import { Socket } from 'socket.io'

const onlineUsers = new Map()

class WebSocket {
    constructor(private socket: Socket) {}

    joinSession(userId: string | string [] | undefined) {
        if (userId && userId !== 'undefined') {
            onlineUsers.set(+userId, {socketId: this.socket.id})
        }
    }

    leaveSession(userId: string | string [] | undefined) {
        if(userId && userId !== 'undefined') {
            onlineUsers.delete(+userId)
            this.socket.disconnect()
        }
    }
}

export default WebSocket