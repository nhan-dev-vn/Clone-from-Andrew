// backend/routes/api/session.js
const express = require('express');
// const { Op } = require("sequelize");

const { Sequelize, Op } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...

const router = express.Router();


// Delete a Review Image
router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const imageId = req.params.imageId

    if(!imageId || imageId === 'null'){
        return res.status(404).json({
            message: "Review Image couldn't be found",
            statusCode: 404
        })
    }

    const findImage = await ReviewImage.findByPk(imageId)

    if(!findImage){

        return res.status(404).json({
            message: "Review Image couldn't be found",
            statusCode: 404
        })

    }

    const findReview = await Review.findByPk(findImage.dataValues.reviewId)

    if(findReview.dataValues.userId !== user.id){
        return res.status(400).json({message: "validation error"})
    }

    await findImage.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})

module.exports = router
