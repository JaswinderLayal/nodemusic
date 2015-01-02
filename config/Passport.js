var passportLocal = require('passport-local');
var userModel = require("./database.js").Users();
var localStrategy = passportLocal.Strategy;
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        console.log(user);
        done(null, user._id);
    });
    
    passport.deserializeUser(function (id, done) {
        userModel.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use('local-signup', new localStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback : true
    }, function (request, username, password, done) {
        process.nextTick(function () {
            userModel.findOne({ "username": username }, function (err, user) {
                if (user) {
                    return done(null, false, request.flash("signupMessage","User Already Exists"));
                }
                else {
                    var newUser = new userModel({
                        username: username,
                        password:password
                    });
                    newUser.password = newUser.generatePasswordHash(newUser.password);
                    newUser.save(function (err, rply) {
                        if (err) throw err;
                        else {
                            return done(null, newUser);
                        }
                    });
                }

            });
        });
    }));
   
    passport.use("local-login", new localStrategy({
        usernameField:"username",
        passwordField: "password",
        passReqToCallback:true
    }, function (request,username,password,done) {
        userModel.findOne({ "username": username }, function (err, user) {
            if (err) throw err;
            else {
                if (!user) {
                    return done(null, false, request.flash("loginMessage", "This User doesnot exists"));
                    
                }
                else {
                    if (user.comparePassword(password)) {
                        return done(null,user);
                    }
                    else {
                        return done(null, false, request.flash("loginMessage", "Password is incorrect"));
                    }
                }
            }
        });

    }));

}