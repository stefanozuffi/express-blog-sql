const {postsArray} = require('../data/postsArray.js')
const { connection, query }  = require('../data/configuration.js');

function index(req, res) {
    
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
    const sql = 'SELECT posts.*, tags.label as tag_label FROM posts JOIN post_tag ON post_tag.post_id = posts.id JOIN tags ON post_tag.tag_id = tags.id WHERE posts.id=?;'

    connection.query(sql, [postID], (err, result) => {

        if (err) return res.status(500).json({error: 'DATABASE ERROR'}); 
        else if (result.length === 0) return res.status(404).json({error: 'no post with current parameter id', id: postID})
            
        const { tag_label, ...postData } =  result[0] 
        const tags = result.map(x => x.tag_label).filter(tag => tag !== null)
        res.status(200).json({...postData, tags}) 
        })
}
    
async function store(req, res) { 

    const { title, content, image, tag_ids=[] } = req.body; 

    //Request Error Handling 
    if (!title || !content || !image) { 
        return res.status(400).json({ 
                success: false, 
                message: 'Title, Content and Image must be not null in req.body' 
            }) 
    } 

    //Tags Handling
    if (!Array.isArray(tag_ids)) {
        res.status(400).json({
            success: false, 
            message: '"tags" in req.body is not an Array' 
        }) 
    } 

    try {
        const sql = 'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)'
        const result = await query(sql, [title, content, image])

        const newID = result.insertId 
        const tags = [] 

        //If the tagID is valid, we push its label in tags + add row to post_tag
        if (tag_ids.length > 0) {
            for (const tagID of tag_ids) {
                const tag_sql = 'SELECT * FROM tags WHERE id=?'

                const tag_result = await query(tag_sql, [tagID])
                if (tag_result.length > 0) {
                    const pivot_sql = 'INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)'
                    await query(pivot_sql, [newID, tagID])

                    tags.push(tag_result[0].label)
                } 
            }
        }

        res.status(201).json({
            id: newID, 
            title, 
            content, 
            image, 
            tags 
        })

    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error });
    }
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
