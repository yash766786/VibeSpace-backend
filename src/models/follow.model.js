import mongoose, {Schema} from "mongoose";

const followSchema = new Schema(
    {
        follower: {    //one who follow
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        following: {       //one to whom 'follwer' is subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Follow = mongoose.model("Follow", followSchema)