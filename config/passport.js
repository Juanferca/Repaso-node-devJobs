const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    }, async (email, password, done) => {
        const usuario = await Usuarios.findOne({ email });
            if(!usuario) return done(null, false, {
                message: 'Usuario no existente'
            });
            // El usuario existe vamos a verificarlo
        const verificaPass = usuario.compararPassword(password);
        if(!verificaPass) return done(null, false, {
            message: ' Password Incorrecto'
        });
            // El usurio existe y el password es correcto
            return done(null, usuario);
    }));
    passport.serializeUser((usuario, done) => done(null, usuario._id));
    passport.deserializeUser(async (id, done) => {
        const usuario = await Usuarios.findById(id).exec();
        return done(null, usuario);
    });

    module.exports = passport;