import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema({
    postFile: {
        type: String,    // cloudinary url
        required: true
    },
    description: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{
    timestamps: true
})

postSchema.plugin(mongooseAggregatePaginate)

export const Post = mongoose.model("Post", postSchema);