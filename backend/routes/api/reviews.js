// backend/routes/api/session.js
const express = require('express');
const { Op } = require("sequelize");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...

const router = express.Router();


// Get all Reviews of the Current User
router.get('/', restoreUser, requireAuth, async (req, res) => {
    const { user } = req

    const allReviews = await Review.findAll({
        where: {
            userId: user.id
        },
        include: [
            {
                model: Spot,
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
                    "price",
                    // "avgRating",  NEED TO ADD AVG RATING
                    // "previewImage"   NEED TO ADD PREVIEW IMAGE
                ]
            },
            {
                model: ReviewImage,
                attributes: [
                    'id', 'url'
                ]
            }
        ],
    })

    return res.status(200).json({
        Reviews: allReviews
    })

})

// Get all Reviews by a Spot's id
router.get('/:spotId', async (req, res) => {

    const reqSpotId = req.params.spotId

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


// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const imageData = req.body

    const reviewId = req.params.reviewId

    const findReview = await Review.findByPk(reviewId)

    if(!findReview){
        return res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }

    // NEED LOGIC FOR MORE THAN 10 IMAGES

    if(findReview.userId === user.id){
        const createReviewImage = await ReviewImage.create({
            reviewId: reviewId,
            ...imageData
        })

        return res.status(200).json(createReviewImage)
    }

    return
})


// Edit a Review
router.put('/:reviewId', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const reviewId = req.params.reviewId

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

    let findReview = await Review.findByPk(reviewId)

    if(!findReview){
        return res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }

    findReview = await findReview.update({
        review: `${review}`,
        stars: `${stars}`
    })

    await findReview.save()

    return res.status(200).json(findReview)

})


// Delete a Review
router.delete('/:reviewId', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const reviewId = req.params.reviewId

    const findReview = await Review.findBYPk(reviewId)

    if(!findReview){
        return res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }

    await findReview.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})





module.exports = router
