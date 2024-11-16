const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send({msg:'Access Denied'});

  // Split the 'Bearer <token>' string to extract the token
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send({msg:'Access Denied'});

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach the decoded user info to the request
    next();
  } catch (err) {
    res.status(400).send({msg:'Invalid Token'});
  }
};

module.exports = authMiddleware;
