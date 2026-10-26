import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// Basic email format check (input validation)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Same answer whether or not the email was already registered, so signup can't be used
// to find out who has an account.
const SIGNUP_RESPONSE = "Registration received. You can now log in. If you already have an account, log in with your existing password.";
const DUMMY_PASSWORD_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

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

           // Hash first, so both outcomes take the same amount of time.
           const hashedPassword = await bcrypt.hash(password, 10);

           const existingUser = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
           if(!existingUser){
             try{
               await new User({
                 name,
                 email,
                 password: hashedPassword,
               }).save();
             }
             catch(error){
               // Two signups for one email at the same moment: the loser gets the same answer.
               if(error?.code !== 11000) throw error;
             }
           }

           res.status(201).json({message: SIGNUP_RESPONSE});

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

          const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
          const isMatch = await bcrypt.compare(
            password,
            user?.password || DUMMY_PASSWORD_HASH
          );

          if (!user || !user.password || !isMatch) {
            return  res.status(400).json({message: "Invalid Credentials!"});
          }

          const token = JWT.sign(
            { id: user._id, tokenVersion: user.tokenVersion },
            process.env.JWT_SECRET_KEY,
            {expiresIn: "20m"}
          );

          res.status(200).json({
            message: "Login Sucessfully!",
            token,
           user: {
             id: user._id,
             name: user.name,
             email: user.email,
             role: user.role,
             authProvider: user.authProvider,
             emailVerified: user.isEmailVerified,
             hasPassword: !!user.password
           }
          });
      }
      catch(error){
         console.error("Login error:", error);
         res.status(500).json({message: "Server Error"});
      }
};

export const logout = async (req, res) => {
      try {
          await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
          res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
          console.error("Logout error:", error);
          res.status(500).json({ message: "Server Error" });
      }
};