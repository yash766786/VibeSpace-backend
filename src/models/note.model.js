import mongoose, {Schema} from "mongoose";

const noteSchema = new Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        theme: {
            type: String,
            default: "black"
        }
    },
    {
        timestamps: true
    }
)

export const Note = mongoose.model("Note", noteSchema)