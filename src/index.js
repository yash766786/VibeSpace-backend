// index.js
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import app from "./app.js";

// configuration
dotenv.config({path: './env'})

connectDB()
.then(() =>{
    app.listen(process.env.PORT, () => {
        // console.log("app listening on port ", process.env.PORT)
    })
})
.catch(() =>{
    process.exit(1);
})