// backend/auth.js
const jwt  = require('jsonwebtoken');
const User = require('./models/Users');

exports.signup = async (req, res) => {
  const { name, username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, msg: 'Username & password required.' });
  }

  try {
    const user = new User({ name, username, password });
    await user.save();
    return res.json({ success: true, msg: 'User created.' });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, msg: 'Username already exists.' });
    }
    return res.status(500).json(err);
  }
};

exports.signin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, msg: 'Username & password required.' });
  }

  try {
    const user = await User.findOne({ username })
      .select('username password')
      .exec();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: 'Authentication failed.' });
    }

    // comparePassword still uses callback
    user.comparePassword(password, isMatch => {
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, msg: 'Authentication failed.' });
      }
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.SECRET_KEY
      );
      return res.json({ success: true, token: 'JWT ' + token });
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
