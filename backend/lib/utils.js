const JWT = require('jsonwebtoken');
const User = require('../models/user.model')

async function generateToken(userId, res) {
    const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('JWT', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development", // use HTTPS in production
        sameSite: 'strict', // recommended for CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    });

    return token;
}

async function protectRoute(req,res,next){
    try{
        const token = req.cookies.JWT

        if(!token){
            return res.status(401).json({
                message: "Unauthorized- No Token Provided"
            })
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET)
        if (!decoded){
            return res.status(401).json({
                message: "Unauthorized - Invalid token"
            })
        }

        const user = await User.findById(decoded.userId).select('-password');

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        req.user = user
        next()
    } catch (err) {
    console.error('Error in protectRoute middleware:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

}

module.exports ={ generateToken,
    protectRoute
}
