const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
// carregando diretorios estaticos
const path = require('path');
// carregando rotas
    const admin = require('./routes/admin');
    const user = require('./routes/user');
//carregando models
require('./models/Posting')
const Posting = mongoose.model('posts');

require('./models/Category');
const Category = mongoose.model('categories');

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

    // Path - arquivos estaticos 
        app.use(express.static(path.join(__dirname, 'public')));
        app.use(express.static(path.join(__dirname, 'uploads')));
    

// Rotas
    app.use('/admin', admin);
    app.use('/user', user);

    // rota principal
        app.get('/', (req , res) => {
            Posting.find().populate('category').sort({date: 'desc'}).then((posts) => {
                Category.find().then((categories) => { 
                    const user = {
                        name: 'leo',
                        idade: 23,
                        forca: 'ultra'
                    }
                        res.render('index', {posts: posts, categories: categories, user: user})          
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao mostrar os elementos na página');
                    res.redirect('/');
                });         
           }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno')
               res.redirect('/404')
           })
        });

    // posts 

        app.get('/postagem/:slug', (req,res) => {
            Posting.findOne({slug: req.params.slug}).then((posting) => {
                if(posting){
                    res.render('posting/index', {posting: posting})
                }else{
                    req.flash('erro_msg', 'Esta postagem não existe')
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('erro_msg', 'Houve um erro interno')
                res.redirect('/')
            })
        })

    // categorias

    app.get('/categorias/:slug', (req,res) => {
        Category.findOne({slug: req.params.slug}).then((category) => {
            if(category){
                Posting.find({category: category._id}).then((posts) => {
                    res.render('category/posts', {posts: posts, category: category})
                }).catch((err) => {
                    req.flash('erro_msg', 'Houve um erro ao listar as postagens')
                    res.redirect('/')
                })
            }else{
                req.flash('erro_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro interno ao carregar a pagina desta categoria')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })


const PORT = 8091;

app.listen(PORT, () => {
    console.log('Servidor rodando!');
})
