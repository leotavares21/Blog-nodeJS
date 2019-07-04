const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
// carregando diretorios estaticos
const path = require('path');

// pegando rotas admin
    const admin = require('./routes/admin')

const app = express();

// Configurações

    // sessão
        app.use(session({
            secret: 'blogNode',
            resave: true,
            saveUninitialized: true
        }));
        app.use(flash());

        app.use((req,res,next) => {
            // criando variaveis globais 
                res.locals.success_msg = req.flash('success_msg');
                res.locals.error_msg = req.flash('error_msg');
                next();
            });

    // mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/booblog", {useNewUrlParser: true}).then(() => {
            console.log("Conectado ao mongo!");
        }).catch((err) => {
            console.log("Erro ao se conectar no mongo!: " + err);
        })

    // body parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    // Public - chamando pasta de arquivos estaticos 
        app.use(express.static(path.join(__dirname, 'public')));


// Rotas
    app.use('/admin', admin);

    // rota principal
        app.get('/', (req , res) => {
            res.render('index');
        });



const PORT = 8091;

app.listen(PORT, () => {
    console.log('Servidor rodando!');
})
