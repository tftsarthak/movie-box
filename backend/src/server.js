import "dotenv/config"
import connectDB from "./db/dbConnection.js";
import { app } from './app.js'
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.get('/api/test', (req, res) => { res.send("hello world") });
        app.use(errorHandler);
        app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port : ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
