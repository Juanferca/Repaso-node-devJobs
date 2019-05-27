const passport = require('passport');
const mongoose = require('mongoose');
const  Vacante = mongoose.model('Vacante');
const  Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');




exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {
        // revisar el usuario
        if(req.isAuthenticated()){
            return next();//estan autenticados
        }
        // redireccionar
        res.redirect('/iniciar-sesion');

}


exports.mostrarPanel = async (req, res) => {

    //Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id})

    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        tagline: 'Crea y administra tus vacantes aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes 
    });
}

exports.cerrarSesion = ( req, res ) => {
    req.logout();
    req.flash('correcto','Cerraste sesión correctamente')
    return res.redirect('/iniciar-sesion');
}

// Formulario para reiniciar el password

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecer-password', {
        nombrePagina: 'Restablece tu password',
        tagline: 'Si ya tinenes una cuenta pero olvidaste tu password, coloca tu email'
    })
}

// Genera el token en la tabla del usurio
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
       req.flash('error', 'No existe esa cuenta');
       return res.redirect('/iniciar-sesion');
    }

    // El usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
    console.log(resetUrl)

    // enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'main'
    })



    // Todo correcto

    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')
}

// Valida si el token es valido y el usuario existe, muestra la vista

exports.restablcerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    // Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}

// almecena el nuevo passsword en la base de datos
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        } 
    });
    //No exite el usuario o el token no es valido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;
    
    await usuario.save();
    // Redirigir
    req.flash('Correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion');



}


