import "dotenv/config"
import connectDB from "./db/dbConnection.js";
import { app } from './app.js'
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

connectDB()
    .then(() => {
        app.get('/test', (req, res) => { res.send("hello world") });
        app.use(errorHandler);
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
