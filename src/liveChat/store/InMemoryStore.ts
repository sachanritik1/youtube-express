import { Store, userId } from "./Store"
import { Chat } from "./Store"

export interface Room {
    id: string
    chats: Chat[]
}

export class InMemoryStore implements Store {
    private store: Map<string, Room>
    constructor() {
        this.store = new Map()
    }
    initRoom(roomId: string) {
        this.store.set(roomId, { id: roomId, chats: [] })
    }
    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId)
        if (!room) return []
        return room.chats.slice(offset, offset + limit)
    }
    addChat(roomId: string, message: string, userId: userId) {
        const chat: Chat = {
            id: Math.random().toString(36).substr(2, 9),
            sender: userId,
            message: message,
            upVotes: [],
        }
        const chats = this.store.get(roomId)?.chats
        if (!chats) return
        chats.push(chat)
        if (chats.length > 100) {
            chats.shift()
        }
    }
    upVote(roomId: string, chatId: string, userId: userId) {
        const room = this.store.get(roomId)
        //TODO: Make this faster
        const chat = room?.chats.find((chat) => chat.id === chatId)
        chat?.upVotes.push(userId)
    }
}
