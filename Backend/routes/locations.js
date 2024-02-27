const express = require('express')
const {
    createLocation,
    getLocations,
    getLocation,
    deleteLocation,
    updateLocation

} = require('../controllers/locationController')


const router =  express.Router()



// get all locations
router.get('/',getLocations)

//get a single location
router.get('/:id',getLocation)

// POST new location
router.post('/',createLocation)

//DELTE location
router.delete('/:id', deleteLocation)

//update a location
router.patch('/:id', updateLocation)

module.exports = router