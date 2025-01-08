import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,  // Frontend origin
    credentials: true,                // Allow cookies and credentials
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "256kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import
import userRouter from "./routes/user.routes.js"
import noteRouter from "./routes/note.routes.js"
import postRouter from "./routes/post.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import followRouter from "./routes/follow.routes.js"


// routes declaration
app.use('/api/v2/users', userRouter)
app.use('/api/v2/notes', noteRouter)
app.use('/api/v2/posts', postRouter)
app.use('/api/v2/comments', commentRouter)
app.use('/api/v2/likes', likeRouter)
app.use('/api/v2/follow', followRouter)


export default app