const express = require('express');
const router = express.Router();
const homeControllers = require('../controllers/homeController');
const vacantesController = require('../controllers/vacanteController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const cors = require('cors');

module.exports = () => {

    router.get('/', homeControllers.motrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva', authController.verificarUsuario,
                                  vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario,
                                   vacantesController.validarVacante,
                                   vacantesController.agregarVacante);

    // editar vacante
    router.get('/vacantes/editar/:url', authController.verificarUsuario,
                                        vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', authController.verificarUsuario,
                                         vacantesController.validarVacante,
                                         vacantesController.editarVacante);

    // Eliminar vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
            usuariosController.validarRegistro,
            usuariosController.crearUsuario);

    // Authenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);


    // Resetear password (email)

    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.enviarToken);

    // Resetear password

    router.get('/restablecer-password/:token', authController.restablcerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);

    // Cerrar sesión
    router.get('/cerrar-sesion', authController.verificarUsuario,
                                 authController.cerrarSesion);

    // Panel de administración
    router.get('/administracion', authController.verificarUsuario,
                                  authController.mostrarPanel);
 
    // Editar perfil
    router.get('/editar-perfil' , authController.verificarUsuario,
                                  usuariosController.formEditarPerfil);
    router.post('/editar-perfil' , authController.verificarUsuario,
                                    /* usuariosController.validarPerfil, */
                                   usuariosController.subirImagen,
                                  usuariosController.editarPerfil);

     // Mostrara vacante
     router.get('/vacantes/:url', vacantesController.mostrarVacante);
    
    // Recibir mesajes de candidatos
    
    router.post('/vacantes/:url', vacantesController.subirCV,
                                   vacantesController.contactar);

    // Muestra los candidatos por vacante

    router.get('/candidatos/:id', authController.verificarUsuario,
                                  vacantesController.mostrarCandidatos)

    // Buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes)

    return router;  
}