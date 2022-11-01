const { check, query, body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const validateFilters = [
    query('page')
        .customSanitizer(val => val || 1)
        .isInt({ min: 1, max: 10 })
        .withMessage("Page must be greater than or equal to 1"),
    query('size')
        .customSanitizer(val => val || 20)
        .isInt({ min: 1, max: 20 })
        .withMessage("Size must be greater than or equal to 1"),
    query('maxLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage("Maximum latitude is invalid")
        .optional(),
    query('minLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage("Minimum latitude is invalid")
        .optional(),
    query('minLng')
        .isFloat({ min: -180, max: 180 })
        .withMessage("Maximum longitude is invalid")
        .optional(),
    query('maxLng')
        .isFloat({ min: -180, max: 180 })
        .withMessage("Minimum longitude is invalid")
        .optional(),
    query('minPrice')
        .isInt({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0")
        .optional(),
    query('maxPrice')
        .isInt({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0")
        .optional(),
    handleValidationErrors
  ];

  const validateSpotBody = [
    body('name')
        .exists()
        .withMessage('Name is required')
        .trim()
        .isLength({min:1, max:50})
        .withMessage("Name must be less than 50 characters"),
    body('address')
        .exists()
        .withMessage("Street address is required")
        .trim(),
    body('city')
        .exists()
        .withMessage("City is required")
        .trim(),
    body('state')
        .exists()
        .withMessage("State is required")
        .trim(),
    body('country')
        .exists()
        .withMessage("Country is required")
        .trim(),
    body('lat')
        .exists()
        .withMessage('Latitute is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude is not valid"),
    body('lng')
        .exists()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude is not valid"),
    body('description')
        .exists()
        .withMessage("Description is required")
        .trim(),
    body('price')
        .exists()
        .isInt({ min: 0 })
        .withMessage("Price per day is required"),

    handleValidationErrors
  ];

  const validateReviewBody = [
    body('review')
        .exists()
        .withMessage("Review text is required"),
    body('stars')
        .exists()
        .withMessage("Rating text is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Stars must be an integer from 1 to 5"),

    handleValidationErrors

  ]

  const validateReviewImageBody = [
    body('url')
        .exists()
        .withMessage("URL is required")
        .isURL(),

    handleValidationErrors

  ]

  const validateBookingBody = [
    body('startDate')
        .exists()
        .withMessage("startDate is required")
        .isAfter()
        .withMessage("startDate cannot be in the past"),
    body('endDate')
        .exists()
        .withMessage("endDate is required")
        .isAfter()
        .withMessage("endDate cannot be on or before startDate"),

    handleValidationErrors

  ]

  const validateSpotImageBody = [
    body('url')
        .exists()
        .withMessage("URL is required")
        .isURL(),
    body('preview')
        .custom(value => value || false)
        .isBoolean()
        .withMessage('Preview should be either true or false'),

    handleValidationErrors

  ]


  module.exports = {
    validateFilters, validateSpotBody, validateBookingBody, validateReviewBody, validateReviewImageBody, validateSpotImageBody
  };
