import jwt from "jsonwebtoken";

export const protect = (req, res, next) =>{
       const authHeader = req.headers.authorization;

       if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No token, No Access!!!"});
       }

       const token = authHeader.split(' ')[1];

       try{
         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
         req.user = decoded;
         next();
       }
       catch(error){
        res.status(401).json({ message: "Invalid or expired token" });
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