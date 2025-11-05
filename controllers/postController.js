const {postsArray} = require('../data/postsArray.js')
const connection  = require('../data/configuration.js')

function index(req,res) {
    
    const sql = 'SELECT * FROM posts'

    connection.query(sql, (err, result) => {
        if (err) return res.status(500).json({error: 'server cannot retrieve data from database'});
        res.json(result)
    })
        // let resArray = postsArray
        // if (req.query.tag) {
        //     resArray = postsArray.filter(post => post.tags.includes(req.query.tag))
        //     console.log(req.query.tag)
        // }
        // res.json(resArray) 
}

function show(req, res) { 
    const postID = parseInt(req.params.id) 
    const thisPost = postsArray.find(post => post.id === postID) 

    if (!thisPost) { 
        res.status(404).json({ 
            success: false,
            message: 'Post non trovato' 
        })
    }

    res.json(thisPost)
    
}

function store(req, res) { 
    const { title, img, tags, content } = req.body;

    //Request Error Handling 
    if (!title || !content) {
        res.status(400).json({
            success: false,
            message: 'Title e Content sono obbligatori'
        })
    }

    if (typeof img !== 'string') { 
        res.status(400).json({ 
            success: false,
            message: 'Img deve essere una stringa'
        })
    }

    // Creazione nuovo Post
    const maxID = Math.max(...postsArray.map(post => post.id))

    const newPost = { 
        id: maxID + 1,
        title: title,
        content: content,
        img: img,
        tags: Array.isArray(tags) ? tags : []
    }

    postsArray.push(newPost)
    console.log(postsArray);
    
    res.status(201).json(newPost)

    //IMPLEMENTAZIONE ELEMENTARE
    // const newId = postsArray.length
    // const newTitle = `Post ${newId}`
    // const newContent = `Contenuto del ${newTitle}`
    // const newImg = 'some_url'
    // const newTags = ['cucina']

    // const newPost = {
    //     id: newId,
    //     title: newTitle,
    //     content: newContent,
    //     img: newImg,
    //     tags: newTags
    // }

    // postsArray.push(newPost)
    // res.json(newPost)

}

function update(req, res) {

    const {id} = req.params
    const post = postsArray.find(p => p.id === parseInt(id))

    //Error Handling
    //Post non trovato
    if (!post) {
        res.status(404).json({
            error: true,
            message: 'Post non trovato'
        })
    }

    //Modifica del post
    for (let key in post) {

        if (key === 'id') {
            continue
        }

        if (!req.body.hasOwnProperty(key)) {
            return res.status(400).json({
                error: true,
                message: 'Parametri della richiesta incompleti: usare rotta Patch o modificare il body della request.'
            })
        } 

        post[key] = req.body[key]
    }
    //N.B.: per gestire richieste incomplete, sotto commentato c'è il modo fatto in classe


    // post.title = req.body.title
    // post.content = req.body.content
    // post.img = req.body.img
    // post.tags = req.body.tags

    console.log(postsArray)
    res.status(200).json(post)
}

function modify(req, res) {

    const {id} = req.params
    const post = postsArray.find(p => p.id === parseInt(id))

    //Error Handling
    if (!post) {
        res.status(404).json({
            error: true,
            message: 'Post non trovato'
        })
    }

    //Modifica parziale del post
    for (let key in req.body) {
        if (post.hasOwnProperty(key)) {
            post[key] = req.body[key]
        }
    }

    console.log(postsArray)
    res.status(200).json(post)
    //res.send('Modifica parziale del post ' + req.params.id)
}

function destroy(req, res) {

    const postID = parseInt(req.params.id)

    const sql = 'DELETE FROM posts WHERE id = ?'
    connection.query(sql, [postID], (err) => {
        if (err) return res.status(500).json({error: 'failed to delete post'});
        res.sendStatus(204);
    }) 

    // const postIndex = postsArray.findIndex(post => post.id === postID)


    // if (postIndex === -1) {
    //     res.status(404).json({
    //         success: false,
    //         message: 'Post non trovato' 
    //     })
    // } 

    // postsArray.splice(postIndex, 1)
    // console.log(postsArray)

    // res.sendStatus(204)
    
}


module.exports = {
    index, 
    show,
    store,
    update,
    modify,
    destroy
}
