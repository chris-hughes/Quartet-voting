const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Set up a new Express app and create a server instance
const app = express();
const server = require('http').Server(app);

// Set up a new Socket.IO instance to enable real-time updates of the top voted songs
const io = new Server(server);

// Set up a connection to MongoDB
const uri = 'mongodb+srv://FirstUser:FirstPassword@cluster0.nywotlt.mongodb.net/?retryWrites=true&w=majority'
// const uri = "mongodb+srv://FirstUser:FirstPassword@clustername.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true"
mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
});

// Define a schema for the Song model and create a new Mongoose model:
const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    votes: {
        type: Number,
        default: 0,
    },
});

const Song = mongoose.model('Song', songSchema)

// API endpoints

// get all songs
app.get('/api/songs', async(req,res)=>{
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

// vote for a song
app.post('/api/vote', async(req,res)=>{
    const { songId } = req.body;
    const ipAddress = req.ip;
    try {
        // Check if the user has already voted for the song
        const song = await Song.findById(songId);
        if (song.voters.includes(ipAddress)){
            return res.setMaxListeners(400).json({message: 'You have already voted for this song'})
        }
        // Update the vote count and add user's IP address
        const updatedSong = await Song.findByIdAndUpdate(songId, {
            $inc: { votes: 1 },
            $push: { voters: ipAddress },
        }, { new: true });
        // Emit a 'songUpdated' event to update the top voted
        io.emit('songUpdated', updatedSong);
        res.json(updatedSong);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});