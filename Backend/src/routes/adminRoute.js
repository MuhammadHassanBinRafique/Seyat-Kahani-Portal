import express from "express";
import {protect, authorizeRoles} from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/Users", protect, authorizeRoles("doctor"), async(req, res) =>{

    try{
          const users = await User.find().select("-password");
          res.status(200).json(users);
    }
    catch(error){
        res.status(500).json({message: "server Error", error: error.message});
    }
});

router.delete("/Users/:id", protect, authorizeRoles("doctor"), async(req, res) =>{
  
    try{
           await User.findOneAndDelete(req.params.id)
           res.status(200).json({message: "Account deleted Successfully!!!"});
    }
    catch(error){
        res.status(500).json({message: "server Error", error: error.message});
    }
});

export default router;