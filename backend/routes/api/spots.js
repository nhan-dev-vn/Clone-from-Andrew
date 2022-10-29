// backend/routes/api/session.js
const express = require('express');
// const { Op, sequelize } = require("sequelize");

const { Sequelize, Op } = require("sequelize");
// const sequelize = new Sequelize("sqlite::memory:");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize, User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check, query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// ...

const router = express.Router();

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

// Get all Spots
router.get('/', validateFilters, async (req, res) => {

    let { page, size } = req.query

    const { maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query

    const where = {}

    if(maxLat && !minLat){
        where.lat = {[Op.lte]: maxLat };
    }

    if(minLat && !maxLat){
        where.lat = {[Op.gte]: minLat }
    }
    if(minLat && maxLat){
        where.lat = {[Op.between]: [minLat, maxLat] }
    }
    if(minLng && !maxLng){
        where.lng = {[Op.gte]: minLng };
    }

    if(maxLng && !minLng){
        where.lat = {[Op.lte]: maxLng };
    }

    if(maxLng && minLng){
        where.lng = {[Op.between]: [minLng, maxLng] }
    }

    if(minPrice && !maxPrice){
        where.price = {[Op.gte]: minPrice }
    }

    if(maxPrice && !minPrice){
        where.price = {[Op.lte]: maxPrice };
    }

    if(minPrice && maxPrice){
        where.price = {[Op.between]: [minPrice, maxPrice] }
    }

    // size && size > 1 && size <= 20 ? parseInt(size) : 20

    // page && page > 1 && page <= 10 ? parseInt(page) : 1

    const pagination = {
        limit: parseInt(page),
        offset: size * (page - 1),
    }





    const allSpots = await Spot.findAll({

        attributes: [

            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            "createdAt",
            "updatedAt",
            [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
            [sequelize.fn('', sequelize.col('url')), 'previewImage']

        ],

        include: [
            {
                model: SpotImage,
                attributes: [],
                where: {
                            preview: true
                        },
            },
            {
                model: Review,
                attributes: [],
            }
        ],

        group:['Reviews.spotId', 'SpotImages.url', 'Spot.id'],
        // group:['Spot.id'],

        // ...pagination,
        // offset: 1,
        // limit: 5,

        // where

    })

    return res.status(200).json({
        Spots: allSpots
    })

})


// Get all Spots owned by the Current User
router.get('/current', restoreUser, requireAuth, async (req, res) => {

    const { user } = req;

    const allSpots = await Spot.findAll({

        attributes: [

            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            "createdAt",
            "updatedAt",
            [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
            [sequelize.fn('', sequelize.col('url')), 'previewImage']
        ],

        include: [
            {
                model: SpotImage,
                attributes: [
                    // 'url'
                ],
                where: {
                    preview: true
                }
            },
            {
                model: Review,
                attributes: [
                    // 'stars'
                ]
            }
        ],

        group:['Reviews.spotId', 'SpotImages.url', 'Spot.id'],


        where: {
            ownerId: user.id

        }

    })

    return res.json({
        Spots: allSpots
    })

})


// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {

    const spotId = req.params.spotId

    const theSpot = await Spot.findByPk(spotId, {

        attributes: [

            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            [sequelize.fn('count', sequelize.col('review')), 'numReviews'],
            [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
            "createdAt",
            "updatedAt",

            // "avgRating",  NEED TO ADD AVG RATING
            // "previewImage"   NEED TO ADD PREVIEW IMAGE

        ],

        include: [
            {
                model: SpotImage,
                attributes: [
                    'id', 'url', 'preview'
                ],
            },
            {
                model: Review,
                attributes: [
                    // 'stars'
                ]
            },
            {
                model: User,
                as: "Owner",
                attributes: [
                    'id', 'firstName', 'lastName'
                ],


            }
        ],

        group:['Reviews.spotId', 'Spot.id', 'SpotImages.id', 'Owner.id'],

    })

    if(!theSpot){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    return res.json({
        Spots: theSpot
    })
})


// Create a Spot
router.post('/', restoreUser, requireAuth, async (req, res) => {

    const { user } = req


    const {token} = req.params;
    const newSpotData = req.body

    try {
        newSpotData.ownerId = user.id

        const addSpot = await Spot.create(newSpotData)

        return res.json(addSpot)

    } catch(err) {

        console.log(err)

        res.status(400).json({
            message: "Validation Error",
            statusCode: 400,
            errors: {
              address: "Street address is required",
              city: "City is required",
              state: "State is required",
              country: "Country is required",
              lat: "Latitude is not valid",
              lng: "Longitude is not valid",
              name: "Name must be less than 50 characters",
              description: "Description is required",
              price: "Price per day is required"
              }
        })

    }

})


// Add image to Spot based on SpotId
router.post('/:spotId/images', restoreUser, requireAuth, async (req, res) => {

    const spotId = req.params.spotId

    const newImageData = req.body

    const { user } = req

    try {
        newImageData.spotId = spotId

        const findSpot = await Spot.findByPk(spotId)

        if(!findSpot){
            return res.status(404).json({
                message: "Spot couldn't be found",
                statusCode: 404
            })
        } else if(findSpot.ownerId !== user.id ){
            return res.status(400).json({message: 'forbidden action'})
        }

        const addImage = await SpotImage.create(newImageData)

        return res.json(addImage)

    } catch(err) {
        console.log(err)
    }


})


// Edit a Spot
router.put('/:spotId', restoreUser, requireAuth, async (req, res) => {

    const spotId = req.params.spotId

    const newSpotData = req.body



    const { address, city, state, country, lat, lng, name, description, price } = newSpotData

    if(!address || !city || !state || !country || !lat || !lng || !name || !description || !price){

        return res.status(400).json({
            message: "Validation Error",
            statusCode: 400,
            errors: {
                address: "Street address is required",
                city: "City is required",
                state: "State is required",
                country: "Country is required",
                lat: "Latitude is not valid",
                lng: "Longitude is not valid",
                name: "Name must be less than 50 characters",
                description: "Description is required",
                price: "Price per day is required"
            }
        })
    }


    let editSpot = await Spot.update(newSpotData, {
        where: {
            id: spotId
        }
    })

    // await editSpot.save()

    editSpot = await Spot.findByPk(spotId)

    if(!editSpot){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    // console.log('EDIT SPOT ----- ', editSpot)

    return res.json(editSpot)

})


// Delete a Spot
router.delete('/:spotId', restoreUser, requireAuth, async (req, res) => {
    const { user } = req

    const spotId = req.params.spotId

    const findSpot = await Spot.findByPk(spotId)

    if(!findSpot){
        return res.status(404).json({

        })
    }
    if(findSpot.ownerId !== user.id){
        return res.status(400).json({message: "forbidden action"})
    }

    await findSpot.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})


// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {

    const reqSpotId = req.params.spotId

    if(!reqSpotId || reqSpotId === 'null'){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const findSpot = await Spot.findByPk(reqSpotId)

    const findReviews = await Review.findAll({
        where: {
            spotId: reqSpotId
        },
        include: [
            {
                model: User,
                attributes: [
                    'id', 'firstName', 'lastName'
                ]
            },
            {
                model: ReviewImage,
                attributes: [
                    'id', 'url'
                ]
            },
        ]
    })

    if(!findSpot){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const count = await Review.count({
        where: {
            spotId: reqSpotId
        }
    })

    if(count > 10){
        return res.status(403).json({
            message: "Maximum number of images for this resource was reached",
            statusCode: 403
        })
    }
    // console.log('FIND REVIEW  ---------', findReviews)

    return res.status(200).json({
        Reviews: findReviews
    })


})


// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const reqSpotId = req.params.spotId

    if(!reqSpotId || reqSpotId === 'null'){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const reviewData = req.body

    const { review, stars } = reviewData

    if(!review || !stars){
        return res.status(400).json({
            message: "Validation error",
            statusCode: 400,
            errors: {
                review: "Review text is required",
                stars: "Stars must be an integer from 1 to 5"
            }
        })
    }

    const findSpot = await Spot.findByPk(reqSpotId)

    if(!findSpot){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const isAlreadyReviewed = await Review.findAll({
        where: {
            userId: user.id,
            spotId: reqSpotId
        }
    })

    if(isAlreadyReviewed.length){
        return res.status(403).json({
            message: "User already has a review for this spot",
            statusCode: 403
        })
    }


    reviewData.userId = user.id

    reviewData.spotId = reqSpotId

    const newReview = await Review.create(reviewData)

    return res.status(201).json(newReview)

})


// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const spotId = req.params.spotId


    if(!spotId || spotId === 'null'){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const findSpot = await Spot.findByPk(spotId)

    const findUser = await User.findByPk(user.id)

    if(!findSpot || findSpot === []){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    // console.log(findSpot)



    if(findSpot.dataValues.ownerId === user.id){
        const ownerBookings = await Booking.findAll({
            where: {
                userId: user.id
            },
            include: [
               {
                    model: User,
                    where: {
                        id: findUser.dataValues.id
                    },
                    attributes: [
                        'id',
                        'firstName',
                        'lastName'
                    ]
                }
            ],
            attributes: [
                'spotId',
                'startDate',
                'endDate'
            ]
        })

        return res.status(200).json({
            Bookings: ownerBookings
        })

    }

    if(findSpot.dataValues.ownerId !== user.id){
        const userBookings = await Booking.findAll({
            where: {
                userId: user.id
            },
            attributes: [
                'spotId',
                'startDate',
                'endDate'
            ]
        })

        return res.status(200).json({
            Bookings: userBookings
        })
    }

})


// Create a Booking from a Spot based on the Spot's id
router.post('/:spotId/bookings', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const spotId = req.params.spotId

    if(!spotId || spotId === 'null'){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const bookingData = req.body

    const { startDate, endDate } = bookingData

    const findSpot = await Spot.findByPk(spotId)

    if(!findSpot){
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    if(!startDate || !endDate || (new Date(startDate) > new Date(endDate))){
        return res.status(400).json({
            message: "Validation error",
            statusCode: 400,
            errors: {
                endDate: "endDate cannot be on or before startDate"
            }
        })
    }

    if(findSpot.dataValues.ownerId === user.id){

        return res.status(400).json({
            message: "Validation error",
            statusCode: 400,
            errors: {
                endDate: "Spot cannot belong to the current user"
            }
        })

    }

    // ADD DATE CONFLICT LOGIC

    const doesBookingAlreadyExist = await Booking.findAll({
        where: {
            spotId: spotId,
            [Op.or]: [{
                startDate: {
                    [Op.between]: [startDate, endDate]
                }
            }, {
                endDate: {
                    [Op.between]: [startDate, endDate]
                }
            }]

        }
    })

    if(doesBookingAlreadyExist){
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            statusCode: 403,
            errors: {
              startDate: "Start date conflicts with an existing booking",
              endDate: "End date conflicts with an existing booking"
            }
        })
    }

    const newBooking = await Booking.create({

        spotId,
        userId: user.id,
        startDate,
        endDate
    })


    return res.status(200).json({
        newBooking
    })

})







module.exports = router;
