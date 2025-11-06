const { connection, query }  = require('../data/configuration.js');

async function store(req, res) {

    const { label } = req.body
   

    if (!label || typeof label !== 'string' || label.trim() === '') return res.status(400).json({
        message: 'req.body must have a label key with a non-empty string as value'
    })


    try {
        const sql = 'INSERT INTO tags (label) VALUE (?)'
        const storeQuery =  await query(sql, [label]) 

        res.status(201).json({
            id: storeQuery.insertId,
            label
        })   
        
    }
    catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {

            const check_sql = 'SELECT * FROM tags WHERE label = ?'
            const indexQuery = await query(check_sql, [label])

            return res.status(400).json({
                success: false,
                message: `Label already exists at id: ${indexQuery[0].id}`
            });
            
        }

        console.error('Database error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error'
        });
    }
} 


module.exports = { store }