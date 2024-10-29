const jwt = require('jsonwebtoken');
const User = require("../models/User")

const auth = async (req, res, next) => {
    try {
        req.user = null;
        const token = req.headers['token'];
        if (token) {
            const verifyUser = jwt.verify(token, process.env.SK);
            if (verifyUser) {
                const user = await User.findOne({ _id: verifyUser._id });
                if (user) {
                    req.user = user;
                    req.token = token;
                }
            }
        }
    } catch (error) {
        req.user = null;
        console.log(error);
    }
    next();
};

module.exports = auth;
