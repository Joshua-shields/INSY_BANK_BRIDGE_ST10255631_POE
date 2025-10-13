//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
const { body, validationResult } = require('express-validator');

// RegEx patterns for input validation and whitelisting

const INPUT_PATTERNS = {
  name: /^[a-zA-Z\s]{2,50}$/, // requires 2-50 letters and spaces
  idNumber: /^[0-9]{13}$/, // exactly 13 digits
  accountNumber: /^[0-9]{10,16}$/, // 10-16 digits
  password: /^[A-za-z\d@$!%*?&]{8,}$/ // at least 8 characters, letters, numbers, special chars
};

// Registration validation with comprehensive security checks
// 
// confirm that the input  password matches stored password
const validateRegistration = [
  body('name')
    .matches(INPUT_PATTERNS.name)
    .withMessage('Name must contain only letters and spaces') // error message should the name not meet the criteria
    .escape(),
    
  body('idNumber')
    .matches(INPUT_PATTERNS.idNumber)
    .withMessage('ID number must be exactly 13 digits') // error message should the id number not meet the criteria
    .escape(),
    
  body('accountNumber')
    .matches(INPUT_PATTERNS.accountNumber)
    .withMessage('Account number must be 10-16 digits') // error message should the account number not meet the criteria (16 digets max with 10 required as min )
    .escape(),
    
    // password validation
    // at least 8 characters, one uppercase, one lowercase, one number, one special character
    // this is to ensure strong passwords are used
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters') // error message should the password not meet the requirement
    .matches(/(?=.*[a-z])/)
    .withMessage('Password must contain lowercase letter') // error message should the password not meet the criteria
    .matches(/(?=.*[A-Z])/)
    .withMessage('Password must contain uppercase letter') // error message should the password not meet the  requirement
    .matches(/(?=.*\d)/)
    .withMessage('Password must contain a number') // error message should the password not meet the criteria
    .matches(/(?=.*[@$!%*?&])/)
    .withMessage('Password must contain special character') // error message should the password not meet the specificatiom
    .escape(),
    
    // email validation
    // this is to ensure a valid email format is used
    // normalizing email to prevent injection attacks
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address') // error message should the email not meet the criteria
    .normalizeEmail(),
     
    // confirm password matches password
    // this is to ensure the user has correctly entered their desired password 
    // this needs to match the password field which was saved during the registration progrss 
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match'); // error message 
      }
      return true;
    })
];


//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
// Login validation with security controls
// this will ensure that the user inputs are validated and sanitized and matches the stored information in the database 
const validateLogin = [
  body('accountNumber')
    .matches(INPUT_PATTERNS.accountNumber)
    .withMessage('Invalid account number format') // error message 
    .escape(), // break 
     // password field 
  body('password')
    .notEmpty()
    .withMessage('Password is required') // error message 
    .escape()
];

// Forgot password validation

const validateForgotPassword = [
  body('accountNumber')
    .matches(INPUT_PATTERNS.accountNumber)
    .withMessage('Invalid account number format') // error message
    .escape(),
    
  body('idNumber')
    .matches(INPUT_PATTERNS.idNumber)
    .withMessage('ID number must be exactly 13 digits') // error message if id number is to long or to short 
    .escape(),
    
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters') // error message should the password not meet the criteria
    .matches(/(?=.*[a-z])/)
    .withMessage('Password must contain lowercase letter') // error message should the password is incorrect 
    .matches(/(?=.*[A-Z])/)
    .withMessage('Password must contain uppercase letter') // ""
    .matches(/(?=.*\d)/)
    .withMessage('Password must contain a number') // ""
    .matches(/(?=.*[@$!%*?&])/)
    .withMessage('Password must contain special character') // ""
    .escape(),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match'); // error message if the passwords do not match
      }
      return true;
    })
];

// Forgot username validation
const validateForgotUsername = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address') // error message should the email not meet the the requirement 
    .normalizeEmail()
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Export validation middleware
// for use in routes
module.exports = {
  validateRegistration: [...validateRegistration, handleValidationErrors],
  validateLogin: [...validateLogin, handleValidationErrors],
  validateForgotPassword: [...validateForgotPassword, handleValidationErrors],
  validateForgotUsername: [...validateForgotUsername, handleValidationErrors]
};
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////