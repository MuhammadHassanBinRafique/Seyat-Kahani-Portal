import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

export const signup = async (req, res) =>{
      try{
           const {name, email, password} = req.body

           const existingUser = await User.findOne({email});
           if(existingUser){
            return res.status(400).json({message: "User already exist",});
           }

           const hashedPassword = await bcrypt.hash(password, 10);

           const newUser = new User({
             name,
             email,
             password: hashedPassword,
           });

           await newUser.save();
           res.status(201).json({message: "Account created successfully!"});

      }
      catch(error){
        res.status(500).json({message: "Server Error", error: error.message});
          
      }
};

export const login = async (req, res) =>{
      try{
          const {email, password} = req.body;

          const user = await User.findOne({email});

          if(!user){
           return res.status(400).json({message: "Invalid Credentials!"});
          }

          const isMatch = await bcrypt.compare(password,user.password)
          if(!isMatch){
            return  res.status(400).json({message: "Invalid Credentials!"});
          }

          const token = JWT.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "10d"}
          );

          res.status(201).json({
            message: "Login Sucessfully!",
            token,
           user: {id: user._id, name: user.name, role: user.role}
          });
      }
      catch(error){
         res.status(500).json({message: "server Error", error: error.message});
      }
};