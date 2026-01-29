const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();

const userRouter=require("./routes/users");
const cookRouter=require("./routes/cooks");
const authRouter=require("./routes/auth");
const adminRoutes=require("./routes/admin");

const app=express();

app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);
app.use("/api/cooks",cookRouter);
app.use("/api/admin",adminRoutes);

app.get("/",(req,res)=>{
    res.send("Backend is running...");
})

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDb Connected")
}).catch((err)=>{
    console.log(err);
})

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})