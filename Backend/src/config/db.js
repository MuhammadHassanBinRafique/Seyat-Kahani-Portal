import mongoose from "mongoose";

const connectDB = async () => {
 try {
     await mongoose.connect(process.env.MONGODB_URI);
     console.log("Database connected sucessfully!!!!")
 }

 catch (error){
       console.log("connection Failed!!!",error.message)
       process.exit(1);
 }
};

export default  connectDB;