const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const UserSchema=new mongoose.Schema({
    name:{type:String,required:true,trim:true},
    email:{type:String,required:true,trim:true,unique:true,lowercase:true},
    password:{type:String,required:true,select:false,minlength:6},
    role:{type:String,enum:["cook","user","admin"],default:"user"},
    phoneNum:{type:String,required:true,unique:true,trim:true},
    location:{
        type:{type:String,enum:["Point"],default:"Point"},
        coordinates:{type:[Number],default:null} 
    },
    locationString:{type:String,default:""}

},{timestamps:true});

UserSchema.index({location:"2dsphere"});

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
});

UserSchema.methods.matchPassword=async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password);
};

const User=mongoose.model("User",UserSchema);
module.exports=User;
