const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

exports.generateAccessToken = async (user) => {
    return jwt.sign(
        { user_id: user.id },
        JWT_SECRET_KEY,
        { expiresIn: '2d' }
    );
}