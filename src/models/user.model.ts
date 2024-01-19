import mongoose, { ObjectId } from "mongoose"
import bcrypt from "bcryptjs"
import { USER_DB } from "../constants"
import { IUrl, urlSchema } from "./url.model"
import jwt from "jsonwebtoken"

export interface IUser {
    id: ObjectId
    username: string
    email: string
    fullName: string
    avatar: IUrl
    coverImage: IUrl
    watchHistory: string[]
    password: string
    refreshToken: string
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>
    generateAccessToken(): string
    generateRefreshToken(): string
}

export type UserModel = mongoose.Model<IUser, {}, IUserMethods>

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        avatar: {
            type: urlSchema,
        },
        coverImage: {
            type: urlSchema,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.method("isPasswordCorrect", async function (password) {
    return await bcrypt.compare(password, this.password)
})

userSchema.method("generateAccessToken", function () {
    return jwt.sign(
        {
            id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET || "secret",
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
})

userSchema.method("generateRefreshToken", function () {
    return jwt.sign(
        { id: this.id },
        process.env.REFRESH_TOKEN_SECRET || "secret",
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
})

export const User = mongoose.model(USER_DB, userSchema)
