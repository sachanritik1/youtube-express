import { MessageEvent, WebSocket } from "ws"
import { InMemoryStore } from "./store/InMemoryStore"
import { Request } from "express"
import { verifyUser } from "../utils/auth"
import { z } from "zod"
import { wss } from ".."

const store = new InMemoryStore()
store.initRoom("1")

const messageSchema = z.object({
    //type can have only four values: "addChat", "upVote"
    type: z.string(),
    data: z.any(),
})

const addChatSchema = z.object({
    roomId: z.string(),
    msg: z.string(),
})

const upVoteSchema = z.object({
    roomId: z.string(),
    chatId: z.string(),
})

export const liveChatController = async (ws: WebSocket, req: Request) => {
    try {
        await verifyUser(req)
    } catch (error) {
        console.log(error)
        ws.close()
    }

    const userId = req.headers["userId"] as string

    ws.on("message", (message: MessageEvent) => {
        const json = JSON.parse(message.toString())
        const res = messageSchema.safeParse(json)
        if (!res.success) {
            console.log("Invalid message received")
            return
        }
        const { type, data } = res.data

        if (type === "addChat") {
            const res = addChatSchema.safeParse(data)
            if (!res.success) {
                console.log("Invalid data received")
                return
            }
            const { roomId, msg } = res.data
            store.addChat(roomId, msg, userId)
            console.log("Chat added")
        } else if (type === "upVote") {
            const res = upVoteSchema.safeParse(data)
            if (!res.success) {
                console.log("Invalid data received")
                return
            }
            const { roomId, chatId } = res.data
            store.upVote(roomId, chatId, userId)
        } else {
            console.log("Invalid type received")
            // ws.send(JSON.stringify({ error: "Invalid type" }))
        }

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(store.getChats("1", 1, 0)))
                console.log("sending message")
            }
        })
    })

    ws.on("close", () => {
        console.log("WebSocket connection closed")
    })
}
