import mongoose from "mongoose"
import { SUBSCRIPTION_DB } from "../constants/db.constant.js"

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
)

export const Subscription = mongoose.model(SUBSCRIPTION_DB, subscriptionSchema)
