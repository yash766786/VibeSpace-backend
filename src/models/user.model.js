// models/user.model.js
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        avatar: {
            type: String,
            required: true
        },
        verifyCode: {
            type: String,
        },
        verifyCodeExpiry: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.verifyPassword = async function(password){
    // console.log("Input Password:", password);
    // console.log("Stored Password:", this.password);
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", userSchema)