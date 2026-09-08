import express from "express";
import mongoose from "mongoose";
import {protect, authorizeRoles} from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/Users", protect, authorizeRoles("doctor"), async(req, res) =>{

    try{
          const users = await User.find().select("-password");
          res.status(200).json(users);
    }
    catch(error){
        console.error("Get users error:", error);
        res.status(500).json({message: "Server Error"});
    }
});

router.delete("/Users/:id", protect, authorizeRoles("doctor"), async(req, res) =>{

    try{
           const { id } = req.params;

           // Validate the id is a real Mongo ObjectId before querying,
           // otherwise Mongoose throws a raw error that could leak internals.
           if (!mongoose.Types.ObjectId.isValid(id)) {
             return res.status(400).json({ message: "Invalid user id" });
           }

           // Bug fix: findOneAndDelete() needs a filter object, not a raw id string.
           // findByIdAndDelete() is the correct helper for deleting by _id.
           const deletedUser = await User.findByIdAndDelete(id);

           if (!deletedUser) {
             return res.status(404).json({ message: "User not found" });
           }

           res.status(200).json({message: "Account deleted Successfully!!!"});
    }
    catch(error){
        console.error("Delete user error:", error);
        res.status(500).json({message: "Server Error"});
    }
});

export default router;