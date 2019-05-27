const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
require('./config/db');

const express = require('express');
const router = require('./routes');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');
/* const cors = require('cors'); */


require('dotenv').config({ path: 'variables.env' });

const app = express();


// cors
/* app.use(cors());
// Solución a error: Error [ERR_HTTP_HEADERS_SENT] Ojo configurar en servidor
app.use((req, res, next) => {

    // Dominio que tengan acceso (ej. 'http://example.com')
       res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
    
    // Metodos de solicitud que deseas permitir
       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    
    // Encabecedados que permites (ej. 'X-Requested-With,content-type')
       res.setHeader('Access-Control-Allow-Headers', '*');
    
    next();
    }) */

// Habilitar Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Validacion de campos
app.use(expressValidator());

// Habilitar handlebars como view
app.engine('handlebars',
         exphbs({
             defaultLayout:'layout',
             helpers: require('./helpers/handlebars')
         })
        );

app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave:false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})

}));

//Iniciarlizar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// Crear nuestro middleware
app.use(( req, res, next) => { 
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

// 404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

// Administración de los errores
app.use((error, req, res, next ) => {
  res.locals.mensaje = error.message;
  const status = error.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render('error');
});

// DEjar que heroku asigne el puerto

const host = '0.0.0.0';
const port = process.env.PORT

app.listen(port, host, () => {
    console.log('El servidor esta Funcionando');
});