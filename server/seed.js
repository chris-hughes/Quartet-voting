const mongoose = require('mongoose');

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

// Connect to mongo
const uri = 'mongodb+srv://FirstUser:FirstPassword@cluster0.nywotlt.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    const songs = require('./songs.json');
    return Song.insertMany(songs);
})
.then(() => {
    console.log('Succesfully seeded the database');
    mongoose.disconnect();
})
.catch((err)=>{
    console.error(err);
});
