// backend/routes/api/session.js
const express = require('express');
const { Op } = require("sequelize");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const customErrorFormatter = require('../../utils/custom-error-handler')

const { User, Spot, SpotImage, Review, ReviewImage } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...
const { validateReviewBody, validateReviewImageBody} = require('../../utils/expressValidation')

const router = express.Router();


// Get all Reviews of the Current User
router.get('/current', restoreUser, requireAuth, async (req, res) => {
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


// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', restoreUser, requireAuth, validateReviewImageBody, async (req, res, next) => {

    const { user } = req

    const imageData = req.body

    const reviewId = req.params.reviewId

    if(!reviewId || reviewId === 'null'){
        return next(customErrorFormatter("Invalid ReviewId", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
    }

    const findReview = await Review.findByPk(reviewId)

    if(!findReview){
        return next(customErrorFormatter("Review couldn't be found", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
    }

    // NEED LOGIC FOR MORE THAN 10 IMAGES

    if(findReview.userId === user.id){
        const createReviewImage = await ReviewImage.create({
            reviewId: reviewId,
            ...imageData
        })

        return res.status(200).json(createReviewImage)
    }


})


// Edit a Review
router.put('/:reviewId', restoreUser, requireAuth, validateReviewBody, async (req, res, next) => {

    const { user } = req

    const reviewId = req.params.reviewId

    if(!reviewId || reviewId === 'null'){

        return next(customErrorFormatter("Invalid ReviewId", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
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

    let findReview = await Review.findByPk(reviewId)

    if(!findReview){
        return next(customErrorFormatter("Review couldn't be found", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
    }

    findReview = await findReview.update({
        review: `${review}`,
        stars: `${stars}`
    })

    await findReview.save()

    return res.status(200).json(findReview)

})


// Delete a Review
router.delete('/:reviewId', restoreUser, requireAuth, async (req, res, next) => {

    const { user } = req

    const reviewId = req.params.reviewId


    if(!reviewId || reviewId === 'null'){
        return next(customErrorFormatter("Invalid ReviewId", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
    }

    const findReview = await Review.findByPk(reviewId)

    if(!findReview){
        return next(customErrorFormatter("Review couldn't be found", 404))

        // return res.status(404).json({
        //     message: "Review couldn't be found",
        //     statusCode: 404
        // })
    }

    await findReview.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})





module.exports = router
