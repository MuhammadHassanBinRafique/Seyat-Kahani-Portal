import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const doctors = [
    {name:"Dr. Arthur Vance", email:"admin123@gmail.com", password:"qwerty123@"},
    {name:"Dr. Elena Rodriguez", email:"admin456@gmail.com", password:"qwerty456@"},
    {name:"Dr. Simon Chen", email:"admin789@gmail.com", password:"qwerty789@"}
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
            const doctor = new User({...data, password: hashedPassword, role: "Doctor"})
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