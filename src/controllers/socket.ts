import { Socket } from 'socket.io'

const onlineUsers = new Map()

class WebSocket {
    constructor(private socket: Socket) {}

    connection(userId: string | string [] | undefined) {
        if (userId && userId !== 'undefined') {
            onlineUsers.set(+userId, {socketId: this.socket.id})
        }
    }

    disconnect(userId: string | string [] | undefined) {
        if(userId && userId !== 'undefined') {
            onlineUsers.delete(+userId)
            this.socket.disconnect()
        }
    }

    login(userId: string) {
        onlineUsers.set(+userId, {socketRef: this.socket.id})
    }

    logout(userId: string) {
        onlineUsers.delete(+userId)
    }
}

export default WebSocket