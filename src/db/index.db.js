// db/index.db.js
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () =>{
    try {
     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
     // console.log("db connected");
     
    } 
    catch(error){
        process.exit(1);
    }
}

export default connectDB