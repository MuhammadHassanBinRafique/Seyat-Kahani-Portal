import dotenv from "dotenv";
dotenv.config();
import { applyDnsServersFromEnv } from "../utils/dnsConfig.js";
applyDnsServersFromEnv(); // opt-in only (DNS_SERVERS in .env)
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const requiredEnv = (name) => {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

const doctors = [
    {
        name: requiredEnv("DOCTOR_1_NAME"),
        email: requiredEnv("DOCTOR_1_EMAIL"),
        password: requiredEnv("DOCTOR_1_PASSWORD")
    },
    {
        name: requiredEnv("DOCTOR_2_NAME"),
        email: requiredEnv("DOCTOR_2_EMAIL"),
        password: requiredEnv("DOCTOR_2_PASSWORD")
    },
    {
        name: requiredEnv("DOCTOR_3_NAME"),
        email: requiredEnv("DOCTOR_3_EMAIL"),
        password: requiredEnv("DOCTOR_3_PASSWORD")
    }
];

const createadmins = async() =>{
    try{
         await mongoose.connect(process.env.MONGODB_URI)
         console.log("DataBase Connected sucessfully!!!");

         for (const data of doctors){
            const dataexist = await User.findOne({email:data.email})
            if(dataexist){
                console.log(`Skipped this: ${data.email} already exist`);
                continue;
            }
            const hashedPassword = await bcrypt.hash(data.password, 10)
            const doctor = new User({...data, password: hashedPassword, role: "doctor", isEmailVerified: true})
            await doctor.save();
            console.log(`Created admin: ${data.email}`);
         }
         console.log(`All doctors processed successfully.`)
            process.exit();

    }
    catch(error){
      console.error("Error creating admins", error);
      process.exit(1);
    }
};
createadmins();