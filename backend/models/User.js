const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            default: "",
        },
        username: {
            type: String,
            require: true,
            min: 3,
            max: 20,
            unique: true,
            default: "",
        },
        email: {
            type: String,
            require: true,
            max: 50,
            unique: true,
            default: "",
        },
        password: {
            type: String,
            require: true,
            min: 6,
            max: 20,
            default: "",
        },
        bio: {
            type: String,
            max: 100,
            default: "",
        },
        profilePicture: {
            type: String,
            default: "",
        },
        followers: {
            type: Array,
            default: [],
        },
        followings: {
            type: Array,
            default: [],
        },
        isAdmin: {
            type: Boolean,
            default: false,
        }, // panel yapılmayacaksa silinebilir     
    },
    { timestamps: true } // zaman damgası
);

module.exports = mongoose.model("User", UserSchema);
