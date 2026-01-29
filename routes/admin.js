const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const adminOnly = (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(403).json({message:"Admin access only"});
    }
    next();
}

router.get("/", protect, adminOnly, async (req,res)=>{
    res.json({message:"Admin route works"});
});

module.exports = router;
