import dotenv from "dotenv";
dotenv.config();
import { applyDnsServersFromEnv } from "./src/utils/dnsConfig.js";
applyDnsServersFromEnv(); // opt-in only (DNS_SERVERS in .env), see dnsConfig.js
import app from "./app.js";
import connectDB from "./src/config/db.js";


connectDB();

const PORT = process.env.PORT || 3000 
app.listen(PORT, () =>{
    console.log(`server is running on port ${PORT}`)
});

