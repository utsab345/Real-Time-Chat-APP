const User = require('../models/user.model')
const Message = require('../models/message.model')
const v2 = require('../lib/cloudinary')



async function getUserForSidebar(req,res){
    try{
        const loggedInUserId = req.user._id;
        const filteredUserId = await User.find({_id : {$ne: loggedInUserId}}).select('-password')

        res.status(200).json(filteredUserId)
    }catch (err) {
    console.error('Error in getUserForSidebar:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMessages(req, res) {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // optional: sort by time (ascending)

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}

async function sendMessage(req,res){
    try{
        const {text, image} = req.body;
        const { id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (imageUrl){
            const uploadResponse = await v2.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        res.status(201).json(newMessage)
    }catch (error) {
        console.error("Error sending messages:", error.message);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}


module.exports={
    getUserForSidebar,
    getMessages,
    sendMessage,
}