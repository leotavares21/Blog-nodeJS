const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// carregando models
    //Category
        require("../models/Category")
        const Category = mongoose.model('categories')
    //Posting
        require('../models/Posting')
        const Posting = mongoose.model('posts');


router.get('/', (req,res) => {
    res.render("admin/index")
})

router.get('/posts', (req,res) => {
    res.send('<h1>Página de posts</h1>')
})

// Rotas de categorias

router.get('/categorias', (req,res) => {

    Category.find().sort({date: 'desc'}).then((categories) => {
            res.render("admin/categories", {categories: categories});
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao listar as categorias " + err)
            res.redirect('/admin')
        });
    });

router.get('/categorias/add', (req,res) => {
    res.render("admin/addcategories")
})

router.post('/categorias/nova', (req,res) => {

    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({msg: "Nome inválido"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({msg: "Slug inválido"});
    }
    
    if(req.body.nome.length < 2){
        erros.push({msg: "Nome da categoria é muito curto"});
    }

    if(erros.length > 0){
        res.render("admin/addcategories", {erros: erros});
    }else{
        const newCategory = {
            name: req.body.nome,
            slug: req.body.slug
        }
  
        new Category(newCategory).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao criar a categoria, tente novamente!');
            res.redirect('/admin');
        });
    }
});
    

router.get('/categorias/edit/:id', (req,res) => {
        Category.findOne({_id:req.params.id}).then((category) => {
                res.render('admin/editcategories', {category: category});
            }).catch((err) => {
                req.flash('error_msg', "Esta categoria não existe");
                res.redirect('/admin/categorias');
            });
});

router.post('/categorias/edit', (req,res) => {
    Category.findOne({_id: req.body.id}).then((category) => {
        category.name = req.body.nome
        category.slug = req.body.slug

        category.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a nova edição da categoria');
            res.redirect('/admin/categorias');
        });
        
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria');
        res.redirect('/admin/categorias');
    });

});

router.post('/categorias/deletar', (req,res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria ' + err);
        res.redirect('/admin/categorias');
    });
});

// rotas de postagens

router.get('/postagens', (req,res) => {

    Posting.find().populate('category').sort({date: 'desc'}).then((posts) => {
        res.render('admin/posts', {posts: posts});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    });
});

router.get('/postagens/add', (req,res) => {
    Category.find().then((categories) => {
        res.render('admin/addposting', {categories: categories});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario');
        res.redirect('/admin');
    });
});

router.post('/postagens/nova', (req, res) => {

    let erros = [];

    if(req.body.categoria == '0'){
        erros.push({msg: 'Categoria inválida, registre uma categoria'})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const newPosting = {
            title: req.body.titulo,
            description: req.body.descricao,
            content: req.body.conteudo,
            category: req.body.categoria,
            slug: req.body.slug
        }

        new Posting(newPosting).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro durante a criação da postagem');
            res.redirect('/admin/postagens');
        });
    }  
});

router.get('/postagens/edit/:id', (req, res) => {

    Posting.findOne({_id: req.params.id}).then((posting) => {
        Category.find().then((categories) => {
            res.render('admin/editposting', {categories: categories, posting: posting});
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin/postagens');
        })
    }).catch((err) => {
        req.flash('erro_msg', 'Houve um erro ao carregar o formulario de edição');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/edit', (req, res) => {
    Posting.findOne({_id: req.body.id}).then((posting) => {

        posting.title = req.body.titulo
        posting.slug = req.body.slug
        posting.desciption = req.body.descricao
        posting.content = req.body.conteudo
        posting.category = req.body.categoria

        posting.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('erro_msg', 'Erro interno');
            res.redirect('/admin/postagens');
        });
    }).catch((err) => {
        req.flash('erro_msg', 'Houve um erro ao salvar a edição');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/deletar', (req,res) => {
    Posting.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem: ' + err);
        res.redirect('/admin/postagens');
    });
});

module.exports = router;