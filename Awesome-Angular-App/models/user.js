/**
 * Created by P10008025 on 11/12/2014.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String
});