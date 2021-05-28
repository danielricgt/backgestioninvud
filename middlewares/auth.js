const jwt = require('jsonwebtoken');

module.exports.auth_verify = (req, res, next) => {
  const auth = req.get('Authorization');
  const response = {
    status: 401,
    data: {},
    message: 'Unauthorized',
  }
  jwt.verify(auth, process.env.SECRET_SEED, (error, decoded) => {
    if (error) {
      response.data = error;
      return res.status(response.status).json(response);
    } else if (decoded === null) {
      return res.status(response.status).json(response);
    } else if (!decoded.id) {
      return res.status(response.status).json(response);
    }
    next();
  })
}