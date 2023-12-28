import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { USER_DB } from "../constants"

const userSchema = new mongoose.Schema(
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
      //cloudinary
      avatar: {
         type: String,
         default:
            "https://res.cloudinary.com/dkkgmzpqd/image/upload/v1628077449/avatars/default-avatar.png",
      },
      //cloudinary
      coverImage: {
         type: String,
         default:
            "https://res.cloudinary.com/dkkgmzpqd/image/upload/v1628077449/avatars/default-avatar.png",
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
   },
   { timestamps: true }
)

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password, 12)
   next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
         fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
   )
}

userSchema.method.generateRefreshToken = function () {
   return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
   })
}

export const User = mongoose.model(USER_DB, userSchema)
