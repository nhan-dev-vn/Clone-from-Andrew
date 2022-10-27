// backend/routes/api/session.js
const express = require('express');
// const { Op, sequelize } = require("sequelize");

const { Sequelize, Op } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...

const router = express.Router();

// Get all Spots
router.get('/', async (req, res) => {
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
            // [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
            // [sequelize.fn('', sequelize.col('url')), 'previewImage']

            // "avgRating",  NEED TO ADD AVG RATING
            // "previewImage"   NEED TO ADD PREVIEW IMAGE

        ],
        include: [
            {
                model: SpotImage,
                attributes: [
                    'url'
                ],
                where: {
                    preview: true
                },
                // limit: 1,
                required: true
            },
            {
                model: Review,
                attributes: [
                    'stars',
                    // [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
                ],
                // raw: true,
                required: true
            }
        ],


    })

    return res.json({
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
            // "avgRating",  NEED TO ADD AVG RATING
            // "previewImage"   NEED TO ADD PREVIEW IMAGE

        ],

        include: [
            {
                model: SpotImage,
                attributes: [
                    'url'
                ],
                where: {
                    preview: true
                }
            },
            {
                model: Review,
                attributes: [
                    'stars'
                ]
            }
        ],

        where: {
            ownerId: user.id

        }

    })

    const previewUrl = await SpotImage.findAll({

        attributes: [
            "url"
            // "avgRating",  NEED TO ADD AVG RATING
            // "previewImage"   NEED TO ADD PREVIEW IMAGE

        ],

        include: [
            {
                model: Spot,
                attributes: [
                    'id'
                ]
            },
        ],

        where: {
            preview: true,
            // spotId: Spot.id

        }

    })

    allSpots.previewImage = previewUrl

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
            "createdAt",
            "updatedAt",
            [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
            [sequelize.fn('', sequelize.col('url')), 'previewImage']
            // "avgRating",  NEED TO ADD AVG RATING
            // "previewImage"   NEED TO ADD PREVIEW IMAGE

        ],

        include: [
            {
                model: SpotImage,
                attributes: [
                    'id', 'url', 'preview'
                ],
                where: {
                    preview: true
                }
            },
            {
                model: Review,
                attributes: [
                    'stars'
                ]
            },
            {
                model: User,
                attributes: [
                    'id', 'firstName', 'lastName'
                ],
                // where: {
                //     // id: User.id
                // }

            }
        ],

        where: {
            id: spotId

        }

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
router.post('/', requireAuth, async (req, res) => {

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
router.post('/:spotId/images', requireAuth, async (req, res) => {

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
router.put('/:spotId', requireAuth, async (req, res) => {

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

    await editSpot.save()

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
router.delete('/:spotId', requireAuth, async (req, res) => {
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


// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {

    const { user } = req

    const reqSpotId = req.params.spotId

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

    if(isAlreadyReviewed){
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



module.exports = router;
