const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// carregando models
    require("../models/Category")
    const Category = mongoose.model('categories')


router.get('/', (req,res) => {
    res.render("admin/index")
})

router.get('/posts', (req,res) => {
    res.send('<h1>Página de posts</h1>')
})

router.get('/categorias', (req,res) => {

    Category.find().sort({date: 'desc'}).then((categories) => {
            res.render("admin/categories", {categories: categories});
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao listar as categorias")
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
                req.flash('erro_msg', "Esta categoria não existe");
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
            req.flash('erro_msg', 'Houve um erro ao salvar a nova edição da categoria');
            res.redirect('/admin/categorias');
        });
        
    }).catch((err) => {
        req.flash('erro_msg', 'Houve um erro ao editar a categoria');
        res.redirect('/admin/categorias');
    });

});

router.post('/categorias/deletar', (req,res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('erro_msg', 'Houve um erro ao deletar a categoria ' + err);
        res.redirect('/admin/categorias');
    });
});


module.exports = router;