const Location = require('../models/locationModel')
const mongoose = require('mongoose')



//get all locations

const getLocations = async(req, res) => {
    
        const locations =await Location.find({}).sort({createdAt: -1})
        res.status(200).json(locations)
    
    
}


//get a single location

const getLocation = async(req, res) => {
    
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such Location'})
    }

    const location =await Location.findById(id)

    if (!location){
        return res.status(404).json({error: 'No such location'})
    }
     
    
    res.status(200).json(location)


}

//create new location

const createLocation = async (req, res) => {
    const { name, address, phone, devices } = req.body;
    try {
        const location = await Location.create({ name, address, phone, devices });
        res.status(200).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


//delete a location

const deleteLocation = async(req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such Location'})
    }

    const location = await Location.findOneAndDelete({_id: id})

    if (!location){
        return res.status(404).json({error: 'No such location'})
    }

    res.status(200).json(location)
}


//update a location

const updateLocation = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such Location' });
    }
    try {
        const { devices, ...updateData } = req.body;
        let location = await Location.findById(id);
        if (!location) {
            return res.status(404).json({ error: 'No such location' });
        }
        if (devices) {
            if (devices.add) {
                location = await addDeviceToLocation(id, devices.add);
            }
            if (devices.remove) {
                location = await removeDeviceFromLocation(id, devices.remove);
            }
        }
        location.set(updateData);
        await location.save();
        res.status(200).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Function to add a device to a location
const addDeviceToLocation = async (locationId, deviceDetails) => {
    const location = await Location.findById(locationId);
    if (!location) {
        throw new Error('Location not found');
    }
    location.devices.push(deviceDetails);
    await location.save();
    return location;
};


// Function to remove a device from a location
const removeDeviceFromLocation = async (locationId, deviceId) => {
    const location = await Location.findById(locationId);
    if (!location) {
        throw new Error('Location not found');
    }
    location.devices = location.devices.filter(device => device._id.toString() !== deviceId);
    await location.save();
    return location;
};


module.exports = {
    getLocations,
    getLocation,
    createLocation,
    deleteLocation,
    updateLocation
    
}


