// backend/routes/api/session.js
const express = require('express');
// const { Op } = require("sequelize");

const { Sequelize, Op } = require("sequelize");
// const sequelize = new Sequelize("sqlite::memory:");

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const customErrorFormatter = require('../../utils/custom-error-handler')

const { sequelize, User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');

// backend/routes/api/session.js
// ...
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
// ...
const { validateBookingBody } = require('../../utils/expressValidation')

const router = express.Router();

// Get all of the Current User's Bookings
router.get('/current', restoreUser, requireAuth, async (req, res) => {

    const { user } = req

    const currentBookings = await Booking.findAll({
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
                    "description",
                    "price",
                    "createdAt",
                    "updatedAt",
                    // [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
                    [sequelize.fn('', sequelize.col('url')), 'previewImage']

                    // "avgRating",  NEED TO ADD AVG RATING
                    // "previewImage"   NEED TO ADD PREVIEW IMAGE

                ],
                include: [
                    {
                        model: SpotImage,
                        attributes: [
                            // 'url'
                        ],
                        where: {
                            preview: true
                        },
                        // required: true
                    }
                ],
            }
        ]
    })

    return res.status(200).json({
        Bookings: currentBookings
    })

})


// Edit a Booking
router.put('/:bookingId', restoreUser, requireAuth, validateBookingBody, async (req, res, next) => {

    const { user } = req

    const bookingData = req.body

    const bookingId = req.params.bookingId

    if(!bookingId || bookingId === 'null'){
        return next(customErrorFormatter("Invalid Booking Id", 404))


        // return res.status(404).json({
        //     message: "Invalid Booking Id",
        //     statusCode: 404
        // })
    }

    const {startDate, endDate} = bookingData

    const findBooking = await Booking.findByPk(bookingId)

    if(!findBooking){
        return res.status(404).json({
            message: "Booking couldn't be found",
            statusCode: 404
        })
    }

    if(!startDate || !endDate || (new Date(startDate) > new Date(endDate))){
        return res.status(403).json({
            message: "Validation error",
            statusCode: 403,
            errors: {
                endDate: "endDate cannot be on or before startDate"
            }
        })
    }

    if((new Date() > new Date(endDate))){
        return res.status(403).json({
            message: "Validation error",
            statusCode: 403,
            errors: {
                endDate: "Past bookings can't be modified"
            }
        })
    }

    if(findBooking.dataValues.userId !== user.id){
        return next(customErrorFormatter("Forbidden", 400))


        // return res.status(400).json({
        //     message: "validation error"
        // })
    }

    const doesBookingAlreadyExist = await Booking.findAll({
        where: {
            spotId: findBooking.dataValues.spotId,
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

    // console.log('BOOKING EXIST ------',doesBookingAlreadyExist)

    if(doesBookingAlreadyExist.length >= 1){
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            statusCode: 403,
            errors: {
              startDate: "Start date conflicts with an existing booking",
              endDate: "End date conflicts with an existing booking"
            }
        })
    }

    const editBooking = await Booking.update(bookingData, {
            where: {
                id: bookingId
            }
        })

    let updatedBooking
    if(editBooking){
        updatedBooking = {id: bookingId, ...bookingData}
    };

    // await editBooking.save()

    return res.status(200).json({
        updatedBooking
    })

})


// Delete a Booking
router.delete('/:bookingId', restoreUser, requireAuth, async (req, res, next) => {

    const { user } = req

    const bookingId = req.params.bookingId

    if(!bookingId || bookingId === 'null'){
        return next(customErrorFormatter("Invalid BookingId", 404))

        // return res.status(404).json({
        //     message: "Booking couldn't be found",
        //     statusCode: 404
        // })
    }

    const findBooking = await Booking.findByPk(bookingId)

    if(!findBooking){
        return next(customErrorFormatter("Booking couldn't be found", 404))

        // return res.status(404).json({
        //     message: "Booking couldn't be found",
        //     statusCode: 404
        // })
    }

    if(findBooking.dataValues.userId !== user.id){
        return next(customErrorFormatter("Forbidden", 400))

        // return res.status(400).json({
        //     message: "Validation error",
        //     statusCode: 400
        // })
    }

    if(new Date(findBooking.dataValues.startDate) < new Date()){
        return next(customErrorFormatter("Bookings that have been started can't be deleted", 403))

        // return res.status(403).json({
        //     message: "Bookings that have been started can't be deleted",
        //     statusCode: 403
        // })
    }

    await findBooking.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})



module.exports = router
