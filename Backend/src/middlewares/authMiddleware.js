import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) =>{
       const authHeader = req.headers.authorization;

       if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No token, No Access!!!"});
       }

       const token = authHeader.split(' ')[1];

       let decoded;
       try {
         decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
       } catch(error) {
         return res.status(401).json({ message: "Invalid or expired token" });
       }

       try {
         const user = await User.findOne({ _id: decoded.id, deletedAt: null })
           .select("_id role tokenVersion");

         if (!user || typeof user.tokenVersion !== "number" ||
             typeof decoded.tokenVersion !== "number" ||
             user.tokenVersion !== decoded.tokenVersion) {
           return res.status(401).json({message: "Invalid or revoked token"});
         }

         req.user = { id: user._id.toString(), role: user.role };
         next();
       } catch(error) {
         console.error("Authentication lookup error:", error);
         res.status(500).json({ message: "Server Error" });
       }
}; 

export const authorizeRoles =(...allowedRoles) =>{
      return (req, res, next) =>{
        if(!allowedRoles.includes(req.user.role)){
            return res.status(401).json({message: "Authorization denied!!!"});
        }
        next();
      };
};