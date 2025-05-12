const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const {generateToken} = require('../lib/utils')
const v2 = require('../lib/cloudinary')

async function signup(req,res){
    const {fullName, email, password} = req.body;
    try{
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6){
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            })
        }
        const user = await User.findOne({email})
        if (user) return res.status(400).json({
            message:'Email already exists'
        })
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })

        if (newUser){
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic || null
            })

        }else{
            res.status(400).json({
                message: "Invalid user data"
            })
        }
        
    } catch(err) {
    console.error('Error in signup controller:', err.message);
    return res.status(500).json({ message: 'Internal server error' }); // <== this is crucial
}

};

async function login(req,res){
    const {email, password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message : "Invalid Credentials"
            })
        }

       const isPasswordCorrect = await bcrypt.compare(password, user.password)
       if (!isPasswordCorrect){
            return res.status(400).json({
                message : "Invalid Credentials"
            })
       }

       generateToken(user._id, res)

       res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic || null
})

    }catch(err) {
    console.error('Error in signup controller:', err.message);
    return res.status(500).json({ message: 'Internal server error' }); // <== this is crucial
}
}

async function logout(req, res) {
  try {
    res.cookie("JWT", "", { maxAge: 0, httpOnly: true });
    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (err) {
    console.error('Error in logout controller:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateProfile (req,res){
    try{
        const {profilePic} = req.body;
        const userId= req.user._id
        if (!profilePic){
            return res.status(400).json({
                message:"Profile pic is required "
            })
        }
        const uploadResponse = await v2.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{
            profilePic: uploadResponse.secure_url
        },{new: true})

        res.status(200).json(updatedUser)
    }catch (err) {
    console.error('Error in update profile:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function checkAuth (req,res){
    try{
        res.status(200).json(req.user);
    }catch (err) {
    console.error('Error in checkAuth controller :', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports= {signup,
    login,
    logout,
    updateProfile,
    checkAuth
}