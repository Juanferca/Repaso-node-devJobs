const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');


exports.motrarTrabajos = async ( req, res, next ) => {

    const vacantes = await Vacante.find();

    if(!vacantes) return next();
    res.render('home', {
        nombrePagina: 'DevJobs',
        tagline: 'Encuentra y Pública trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    }); 
} 