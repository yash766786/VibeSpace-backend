import mongoose, {Schema} from "mongoose";

const noteSchema = new Schema(
    {
        user: {
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
        tag: {
            type: String,
            default: "General"
        }
    },
    {
        timestamps: true
    }
)

export const Note = mongoose.model("Note", noteSchema)