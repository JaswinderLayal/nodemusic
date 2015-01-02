var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
exports.Users = function () {
    var Schema = mongoose.Schema;
    var UsersSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    });
    UsersSchema.methods.generatePasswordHash = function (password) {
        return bcrypt.hashSync(password);

    }
    UsersSchema.methods.comparePassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }
    return mongoose.model("User", UsersSchema);
};
exports.MusicStore = function () {
    var Schema = mongoose.Schema;
    var track = new Schema({
        trackNumber: { type: Number },
        songTitle: { type: String },
        trackLength: { type: String },
        genre: { type: String },
        song:{type:String},
        albumId:{type:Schema.Types.ObjectId}           
    });
    var album = new Schema({
        title: { type: String },
        Producer: { type: String },
        label: { type: String },  
        release: { type: String },
        albumImage:{ type: String},
        tracks: [{type:Schema.Types.ObjectId,ref:"track"}],
        artistId:{type:Schema.Types.ObjectId,ref:"artist"}
    });
    var MusicStoreSchema = new Schema({
        name: { type: String, required: true, unique: true },
        sortName: { type: String },
        albums: [{ type: Schema.Types.ObjectId, ref: "album" }],
        singerImage: { type: String }
    });
    return {
        artist: mongoose.model("artist", MusicStoreSchema),
        album: mongoose.model("album", album),
        track: mongoose.model("track", track)
    
    };
}