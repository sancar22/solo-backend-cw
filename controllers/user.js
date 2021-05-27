const User = require('../models/user');

exports.getInfo = async (req, res) => {
    try{
        res.status(200)
        res.send('hey')
    }catch (e) {
        res.send('Internal Server Error!')
        res.status(500)
    }
}