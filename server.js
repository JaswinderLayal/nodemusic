var express = require('express');
var url = "mongodb://pk:123123@ds041177.mongolab.com:41177/usersample";
var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
};
var ejs = require("ejs");
var app = express();
var flash = require("connect-flash");
var session = require("express-session");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var multer = require('multer');
var async = require('async');
var done = false;
var port = process.env.port || 8080;
var multer1 = multer({
    dest: './public/images/artists',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }

});
var multer2 = multer({
    dest: './public/images/Albums',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }

});
var multer3 = multer({
    dest: './public/images/Songs',
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }

});
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: "Secreeeetttttt" }));
var passport = require('passport');
require('./config/Passport.js')(passport);
var musicStoreSchema = require('./config/database.js').MusicStore();
app.use(passport.initialize())
app.use(passport.session());
app.set("view engine", "ejs");
var mongoose = require('mongoose');
mongoose.connect(url, function (err) {
    if (err) throw err;
    console.log("Clent connected");
});

var urlEncoded = bodyParser.urlencoded({ extended: false });

app.use(flash());
app.use(express.static(__dirname + "/public"));
app.get("/signup", function (request, response) {
    var flashmessage = request.flash("signupMessage");
    var flashLength = flashmessage.length;
    var newmessage = "";
    console.log(flashmessage);
    console.log(flashLength);
    if (flashmessage.length > 0) {
        newmessage = flashmessage[0];
        console.log(newmessage);
    }
    response.render("signup.ejs", { message: newmessage });
  
});
app.get("/home", function (request, response) {
    response.send("Registered");
});
app.post("/signup", passport.authenticate('local-signup', { successRedirect: '/main', failureRedirect: "/signup", failureFlash: true }));

app.get("/", function (request, response) {
    response.render("MainPage.ejs");
    //response.render("Master.ejs", { user: request.user });

});

app.get("/logout", function (request, response) {
    request.logout();
    response.redirect("/main");
});

app.get("/login", function (request, response) {
    var flashmessage = request.flash("loginMessage");
    var flashLength = flashmessage.length;
    var newmessage = "";
    console.log(flashmessage);
    console.log(flashLength);
    if (flashmessage.length > 0) {
        newmessage = flashmessage[0];
        console.log(newmessage);
    }
    response.render("login.ejs", { message: newmessage });
  
});

app.get("/admin", function (request, response) {
    response.render("Admin.ejs");
});

app.get("/adminmain", isUserAuthenticated, function (request, response) {
    response.render("AdminMain.ejs");
});

app.post("/adminmain", multer1, function (request, response) {
    musicStoreSchema.artist.findOne({ "name": request.body.name }, function (err, artist) {
        if (err) throw err;
        else {
            if (artist) {
               
            }
            else {
                var newArtist = new musicStoreSchema.artist({
                    name: request.body.name,
                    singerImage: request.files.file.name
                });
                //console.log(request.files.file.name);
                
                newArtist.save(function (err, rply) {
                    if (err) throw err;
                    else {
                        if (done == true) {
                            
                        }
                        //console.log(rply);
                    }
                });
            }
           
        }
    });
    response.redirect("/adminmain");
});

app.get("/main/genres", function (request, response) {
    musicStoreSchema.track.find().distinct("genre", function (err, result) {
        
        response.json(result);
    });
    
});

app.get("/search/album/:reqalbum", function (request, response) {
    var requestedAlbum = request.params.reqalbum;
    //musicStoreSchema.album.find({ "title": { $regex: new RegExp("^" + requestedAlbum.toLowerCase(), "i") } }, function (err,data) {
    //    response.json(data);
    //});
    musicStoreSchema.album.find({ "title": { $regex: new RegExp("^" + requestedAlbum.toLowerCase(), "i") } }).populate("tracks").exec(function (err, result) {
        response.json(result);
    });
});
app.get("/search/artist/:reqartist", function (request, response) {
    var requestedArtist = request.params.reqartist;
    musicStoreSchema.artist.find({ "name": { $regex: new RegExp("^" + requestedArtist.toLowerCase(), "i") } }, function (err, data) {
        response.json(data);
    });
});

app.get("/main/genresongss/:genre", function (request, response) {
    var requestedGenre = request.params.genre;
    console.log(requestedGenre);
    musicStoreSchema.track.find({ "genre": requestedGenre }, function (err, tracks) {
        console.log("-------------Tracks-------------------------");
        console.log(tracks);
        response.json(tracks);
    });
    //musicStoreSchema.track.find({ "genre": requestedGenre }, function (err, tracks) {
    //    async.forEach(tracks, function (track, callback) {
    //        //musicStoreSchema.track.populate(track,{path:"albumId"},function (err, data) {
    //        //    console.log(data);
    //        //});
    //        console.log("-----Song Title ------");
    //        console.log(track.songTitle);
    //        console.log("-----Song Title ------");
    //        musicStoreSchema.track.findOne({songTitle:track.songTitle}).populate("albumId").exec(function (err,data) {
    //            console.log(data);
    //        });

    //     }, function (err) {

    //    });
    //    response.json(tracks);
    //});
});

app.get('/main', function (request, response) {
    response.render("MainPage.ejs");
});
app.get('/admin/singers', function (request, response) {
    
    //musicStoreSchema.artist.find().populate('albums').exec(function (err, person) {
    //    if (err) return handleError(err);
    //    console.log(person);
    //    response.status(200).json(person);
    //});
    var newArtists = [];
    
    
    //musicStoreSchema.artist.find().populate('albums').exec(function (err, persons) {
    //      newArtists=newArtists.concat(persons);
    
    //     persons.forEach(function (person,index) {
    //          musicStoreSchema.track.populate(person.albums, { path: 'tracks' }, function (err, output) {
    //              if (err) return handleError(err);
    //              //person.albums.forEach(function (personalbum) {
    //              //    output.forEach(function (album) {
    
    //              //        personalbum.tracks = album.tracks;
    //              //});
    //                  //});
    //                  person.albums = output;
    //              console.log(person);
    
    
    //              //if (output.length > 0) {
    //              //var personObject = person.toObject();
    //              //personObject.albums = output;
    //              //person = personObject;
    //              //person.albums.forEach(function (personalbum) {
    
    //              //});
    //              //    newArtists[index].albums=output;
    //              //    console.log(newArtists[index]);
    //              //   // console.log("New Artist :{{}}", newArtists[index]);
    //              //    //person.albums.push(output);
    //              // //  console.log("newPerson {{}} "+person);
    //              //    //console.log(person.tracks);
    //              //}
    
    //              //console.log(output);
    //          //persons.albums = output;
    //            //console.log(output);
    //      //response.status(200).json(output);
    
    //          });
    //      });
    //      //console.log(persons);
    
    //    response.status(200).json(persons);
    
    
    
    //  });
    var newPerson = [];
    function getData(callback) {
        musicStoreSchema.artist.find().populate('albums').exec(function (err, persons) {
            
            //newPerson = newPerson.concat(persons);
            //console.log(newPerson);
            callback(persons);
        //response.json(persons);
        });
    }
    getData(function (data) {
        //async.each(data,function (artist, callback) {
        //    musicStoreSchema.album.populate(artist.albums, { path: 'tracks' }, function (err, result) {
        //        artist = artist.toObject();
        //        artist.albums = result;
        //        callback();
        //    });
        //});
        var newPerson = [];
        async.each(data, function (artist, callback) {
            musicStoreSchema.album.populate(artist.albums, { path: 'tracks' }, function (err, result) {
                
                if (result.length > 0) {
                    artist = artist.toObject();
                    artist.albums = result;
                }
                
                newPerson.push(artist);
                
                callback();
            });
        }, function (err) {
            console.log(newPerson);
            response.json(newPerson);
        });
       
    });
   


    
  
  
    //persons.forEach(function (person, index) {
    //    musicStoreSchema.album.populate(person.albums, { path: 'tracks' }, function (err, result) {
            
    //        person = person.toObject();
    //        person.albums = result;
    //        newPerson.push(person);
              
    //                //console.log(person);
    //    });
    //});
  
});

app.post("/admin/deleteAlbum/:id", function (request, response) {
    var albumId = request.params.id;
    musicStoreSchema.track.remove({ "albumId": albumId }, function (err, rply) {
        console.log(rply);
    });
    musicStoreSchema.album.remove({ "_id": albumId }, function (err, rply) {
        console.log(rply);
    });
    
    response.sendStatus(200);
});

app.post("/admin/addSongs", multer3, function (request, response) {
    var album = request.body;
    var tracks = JSON.parse(request.body.tracks);
    console.log(request.files);
    
    if (tracks.length > 1 && Array.prototype.isPrototypeOf(request.files.file) == true) {
        request.files.file.forEach(function (track, index) {
            tracks[tracks.length - (request.files.file.length - index)].song = request.files.file[index].name;
            tracks[tracks.length - (request.files.file.length - index)].albumId = album._id;
        });
    }
    else {
        tracks[tracks.length - 1].song = request.files.file.name;
        tracks[tracks.length - 1].albumId = album._id;
    }
    
    
    
    
    //album.tracks.forEach(function (track) {
    //    console.log(track);
    //});
    //var trackArray = request.body.data.tracks;
    //  console.log(request.files);
    //trackArray.forEach(function (track) {
    
    //    track.albumId = album._id;
    //});
    

    async.each(tracks, function (track, callback) {
        musicStoreSchema.track.findOne({ "songTitle": track.songTitle, "trackNumber": track.trackNumber, "genre": track.genre }, function (err, track1) {
        if (err) throw err;
        console.log(track1);
        if (!track1) {
            var newTrack = new musicStoreSchema.track(track);
            newTrack.save(function (err, savedTrack) {
                //console.log("saved Track "+savedTrack);
                process.nextTick(function () {
                    console.log("Album Id : " + album._id);
                    musicStoreSchema.album.findOne({ "_id": album._id }, function (err, album) {
                        album.tracks.push(savedTrack);
                        album.save(function (err, rply) {
                            console.log("New Track" + rply);
                               
                        });
                    });
                });
            });
            callback();
              
                
        }
    });
    }, function (err) {
       
    });

    
    //function GetSuccess(callback) {
      
    //}
    //GetSuccess(function () {
    //    process.nextTick(function () {
    //        response.json("Success");
    //    });
     
    //});
  
 response.json("Success");
  
 
    
    //musicStoreSchema.find({ 'albums': { $elemMatch: { 'title': album.title } } }, function (err, document) {
    //    process.nextTick(function () {
    //        document.albums.forEach(function (albumscrh) {
    //            if (albumscrh.title == album.title) {
    //                albumscrh.tracks = trackArray;

    //            }
    //        });
    //    });
        
    //    document.save(function (err, rply) {
    //        console.log(rply);
    //    });
    //});
   
});

app.post("/admin/addAlbum", multer2, function (request, response) {
    var body = request.body;
    
    request.body.albums = JSON.parse(request.body.albums);
    
    var singerobj = request.body;
    var found = false;
    var lastalbum = singerobj.albums[singerobj.albums.length - 1];
    var filename = request.files.file.name;
    lastalbum.artistId = singerobj._id;
    
    lastalbum.albumImage = filename;
    musicStoreSchema.album.findOne({ "title": lastalbum.title }, function (err, album) {
        console.log("------FoundAlbum-----------");
        console.log(album);
        if (err) throw err;
        if (!album) {
            
            
            
            var newAlbum = new musicStoreSchema.album(lastalbum);
            newAlbum.save(function (err, album) {
                if (err) throw err;
                
                
                musicStoreSchema.artist.findOne({ "_id": singerobj._id }, function (err, artist) {
                    
                    artist.albums.push(album);
                    artist.save(function (err, rply) {
                        if (err) throw err;
                           
                    });
                });
              
              
            });
           
        }
        
        
        
    });
    
    
    //musicStoreSchema.artist.findOne({ "_id": singerobj._id }, function (err, artist) {
    //    process.nextTick(function () {
    //        musicStoreSchema.album.findOne(lastalbum, function (err, album) {
    //            if (err) throw err;
    //            if (!album) {
    //                artist.albums.push(lastalbum);
    
    //                console.log(lastalbum);
    //                var newAlbum = new musicStoreSchema.album(lastalbum);
    //                newAlbum.save(function (err, album) {
    //                    if (err) throw err;
    //                    console.log(album);
    //                });
    
    
    //            }
    
    
    
    //        });
    
    //    });
    
    
    
    //});
    
   
});

app.post("/admin/deleteTrack/:id", function (request, response) {
    var id = request.params.id;
    musicStoreSchema.track.remove({ "_id": id }, function (err, rply) {
        console.log("---------reply-----------");
        console.log(rply);
        response.json("success");
    });
});

app.post("/admin/deleteArtist/:id", function (request, response) {
    var id = request.params.id;
    var albumIds = [];
    //musicStoreSchema.artist.find({ "_id": id }, function (err, rply) {
    //    musicStoreSchema.album.find({ "artistId": id }, function (err, albums) {
    
    //        async.each(albums, function (album, callback) {
    //            albumIds.push(album._id);
    //            //musicStoreSchema.track.remove({ "albumId": album._id }, function (err, tracks) {
    //            //    console.log("------------rply-----------------");
    //            //    console.log(tracks);
    //            //});
    //        }, function (err) {
    //            //musicStoreSchema.album.remove({ "artistId": id }, function (err, albums) {
    //            //});
    //            console.log(albumIds);
    //        });
    
    
    //    });
    //    process.nextTick(function () {
    //        console.log(albumIds);
    //        musicStoreSchema.artist.remove({ "_id": id }, function (err, rply) {
    //            response.json("success");
    //        });
    
    //    });
    
    //});
    function getdata(callback) {
        musicStoreSchema.album.find({ "artistId": id }, function (err, albums) {
            callback(albums);
        });
    }
    getdata(function (albums) {
        var arrayIds = [];
        async.each(albums, function (album, callback) {
            musicStoreSchema.track.remove({ "albumId": album._id }, function (err, rply) {
                arrayIds.push(album._id);
               
            });
            callback();
        }, function (err) {
            musicStoreSchema.album.remove({ "artistId": id }, function (err, rply) {
                console.log("----rply-----");
                
            });
            process.nextTick(function () {
                musicStoreSchema.artist.remove({ "_id": id }, function (err, albums) {
                    response.send("success");
                });
            });
        });
        
        
         
    });
   
});

app.post("/login", passport.authenticate('local-login', { successRedirect: '/adminmain', failureRedirect: "/login", failureFlash: true }));

function isUserAuthenticated(request, response, done) {
    
    if (request.isAuthenticated()) {
        
        done();
    }
    else {
        response.redirect("/login");
    }
}

app.listen(port);