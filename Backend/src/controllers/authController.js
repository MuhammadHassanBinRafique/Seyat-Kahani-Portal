import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// Basic email format check (input validation)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const signup = async (req, res) =>{
      try{
           const {name, email, password} = req.body;

           // --- NoSQL injection guard + input validation ---
           // Reject anything that isn't a plain string (blocks { "$ne": null } style payloads)
           if (
             typeof name !== "string" ||
             typeof email !== "string" ||
             typeof password !== "string"
           ) {
             return res.status(400).json({ message: "Invalid input" });
           }

           if (!isValidEmail(email)) {
             return res.status(400).json({ message: "Please provide a valid email address" });
           }

           if (password.length < 6) {
             return res.status(400).json({ message: "Password must be at least 6 characters long" });
           }

           const existingUser = await User.findOne({ email: email.toLowerCase() });
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
        console.error("Signup error:", error);
        res.status(500).json({message: "Server Error"});

      }
};

export const login = async (req, res) =>{
      try{
          const {email, password} = req.body;

          // --- NoSQL injection guard ---
          // Without this check, a request like { "email": { "$ne": null }, "password": { "$ne": null } }
          // would be passed straight into a Mongo query and could bypass login entirely.
          if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
          }

          if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
          }

          const user = await User.findOne({ email: email.toLowerCase() });

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

          res.status(200).json({
            message: "Login Sucessfully!",
            token,
           user: {id: user._id, name: user.name, role: user.role}
          });
      }
      catch(error){
         console.error("Login error:", error);
         res.status(500).json({message: "Server Error"});
      }
};