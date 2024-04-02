import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"


const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}))
//app.use(cors());

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

//routes
import userRouter from './routes/user.routes.js'
import applicationRouter from './routes/application.routes.js'
import jobRouter from './routes/job.routes.js'

app.use('/api/v1/user', userRouter)
app.use('/api/v1/application', applicationRouter)
app.use('/api/v1/job', jobRouter)


export default app;

