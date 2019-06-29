const express = require('express');
const handlebars = require('express-handlebars');
//chamando diretorios do computador
const path = require('path');

const app = express();

// Public - chamando pasta de arquivos estaticos - com isso posso linkar meus aruivos css e js no arquivo main do handlebars
app.use(express.static(path.join(__dirname, 'public')))

// Configurações
    // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

// rota principal
app.get('/', (req , res) => {
    res.render('index');
})


const PORT = 8091;

app.listen(PORT, () => {
    console.log('Servidor rodando!');
})
