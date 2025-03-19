import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        password: { type: String,required: true },
        phone: { type: Number, required: true },
        email: { type: String, required: true }
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema, "user");


export default User;
