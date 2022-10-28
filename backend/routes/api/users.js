// backend/routes/api/users.js
const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

// backend/routes/api/users.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...

const router = express.Router();


// backend/routes/api/users.js
// ...
const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];


// backend/routes/api/users.js
// ...
/*
// Sign up
router.post(
    '/',
    validateSignup,
    async (req, res) => {
      const { email, password, username, firstName, lastName } = req.body;
      const user = await User.signup({ email, username, password, firstName, lastName });

      await setTokenCookie(res, user);

      return res.json({
        user,
      });
    }
  );
*/


// Sign up a User
router.post(
  '/',
  validateSignup,
  async (req, res) => {

    const { email, password, username, firstName, lastName } = req.body;

    if(!email || !password || !username || !firstName || !lastName){
      return res.status(400).json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          email: "Invalid email",
          username: "Username is required",
          firstName: "First Name is required",
          lastName: "Last Name is required"
        }
      })
    }

    const findUserEmail = await User.findAll({
      where: {
        email: email
      }
    })

    const findUserUsername = await User.findAll({
      where: {
        username: username
      }
    })

    if(findUserEmail.length){
      return res.status(403).json({
        message: "User already exists",
        statusCode: 403,
        errors: {
          email: "User with that email already exists"
        }
      })
    }

    if(findUserUsername.length){
      return res.status(403).json({
        message: "User already exists",
        statusCode: 403,
        errors: {
          email: "User with that username already exists"
        }
      })
    }

    const user = await User.signup({ email, username, password, firstName, lastName });

    await setTokenCookie(res, user);

    return res.json({
      user,
    });
  }
);



module.exports = router;
