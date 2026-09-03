import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from "dotenv";
dotenv.config();
import app from "../Backend/app.js";
import connectDB from "./src/config/db.js";


connectDB();

const PORT = 3000 || prpocess.env.PORT
app.listen(PORT, () =>{
    console.log(`server is running on port ${PORT}`)
});

