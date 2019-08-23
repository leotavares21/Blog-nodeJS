const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

require('../models/User');
const User = mongoose.model('users');

router.get('/cadastro', (req, res) => {
    res.render('users/register')
})

router.post('/cadastro', (req, res) => {
    let erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({msg: 'Nome inválido'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({msg: 'Email inválido'})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({msg: 'Senha inválido'})
    }

    if(req.body.senha.length < 4){
        erros.push({msg: 'Senha muito curta'})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({msg: 'As senhas são diferentes, tente novamente'})
    }
   
    if(erros.length > 0){
        res.render('users/register', {erros: erros})
    }else{
        User.findOne({email: req.body.email}).then((user) => {
            if(user){
                req.flash('error_msg', 'Já existe uma conta com este e-mail no nosso sistema')
                res.redirect('/user/cadastro');
            }else{
                const newUser = new User({
                    name: req.body.nome,
                    email: req.body.email,
                    password: req.body.senha
                    // eAdmin: 1 
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuario')
                            res.redirect('/')
                        }

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuario')
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }  
})


// rota de autenticação

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);

})




module.exports = router;