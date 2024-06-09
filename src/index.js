import dotenv from "dotenv"
import connectDB from "./db/db_connect.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed",err)
})









/*

import express from "express"

const app=express()

(async()=>{
try {
   await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
   app.on("error",(e)=>{
    console.log("Error")
    throw e
   })

   app.listen(process.env.PORT,()=>{
    console.log(`app is listening on port ${process.env.PORT}`)
   })
} catch (error) {
    console.error("Error",error)
    throw err
}
})()

*/