import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// when we get data from form
app.use(express.json({limit:"16kb"}))

//when we get data from url
// app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.urlencoded({extended:true,}))

app.use(express.static("public"))

app.use(cookieParser())

//routes import

import userRouter from './routes/user.routes.js'
import commentRouter from './routes/comment.routes.js'
import videoRouter from './routes/video.routes.js'
import playlistRouter from './routes/playlist.routes.js'


//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/playlists",playlistRouter)

export { app };
