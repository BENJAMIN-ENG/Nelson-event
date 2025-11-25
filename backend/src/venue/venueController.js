import Venue from './venueModel.js';
import Location from '../location/locationModel.js';
import User from '../user/userModel.js';

// Create a new venue
export const createVenue = async (req, res) => {
    try {
        const { placeName, capacity, location } = req.body;

        // Validate required fields
        if (!placeName || !capacity || !location) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: placeName, capacity, and location'
            });
        }

        // Verify location exists
        const locationExists = await Location.findById(location);
        if (!locationExists) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Create venue with authenticated user as creator
        const venue = await Venue.create({
            placeName,
            capacity,
            location,
            createdBy: req.user._id
        });

        // Populate references
        await venue.populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        res.status(201).json({
            success: true,
            data: venue
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all venues (filtered by role)
export const getAllVenues = async (req, res) => {
    try {
        let query = {};

        // If user is Organizer, only show their venues
        // Admins and Attendees see all venues
        if (req.user.role === 'Organizer') {
            query.createdBy = req.user._id;
        }

        const venues = await Venue.find(query).populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        res.status(200).json({
            success: true,
            count: venues.length,
            data: venues
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get venue by ID
export const getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id).populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            data: venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get venues by organizer
export const getVenuesByOrganizer = async (req, res) => {
    try {
        const { organizerId } = req.params;

        // Verify organizer exists and has Organizer role
        const organizer = await User.findById(organizerId);

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: 'Organizer not found'
            });
        }

        if (organizer.role !== 'Organizer') {
            return res.status(400).json({
                success: false,
                message: 'User is not an organizer'
            });
        }

        const venues = await Venue.find({ createdBy: organizerId }).populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        res.status(200).json({
            success: true,
            count: venues.length,
            organizer: {
                id: organizer._id,
                name: organizer.name,
                email: organizer.email
            },
            data: venues
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to recursively get all child location IDs
const getAllChildLocationIds = async (locationId) => {
    // Find all direct children of this location
    const children = await Location.find({ parent: locationId }).select('_id');

    if (children.length === 0) {
        return [locationId]; // No children, return just this location
    }

    // Recursively get all descendants
    let allLocationIds = [locationId];

    for (const child of children) {
        const childIds = await getAllChildLocationIds(child._id);
        allLocationIds = allLocationIds.concat(childIds);
    }

    return allLocationIds;
};

// Get venues by location (includes all child locations recursively)
export const getVenuesByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;

        // Verify location exists
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Get all location IDs (parent + all descendants)
        const allLocationIds = await getAllChildLocationIds(locationId);

        // Find all venues in these locations
        const venues = await Venue.find({
            location: { $in: allLocationIds }
        }).populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        res.status(200).json({
            success: true,
            count: venues.length,
            locationsSearched: allLocationIds.length,
            location: {
                id: location._id,
                name: location.name,
                code: location.code
            },
            data: venues
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update venue
export const updateVenue = async (req, res) => {
    try {
        const { placeName, capacity, location } = req.body;

        // If location is being updated, verify it exists
        if (location) {
            const locationExists = await Location.findById(location);
            if (!locationExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Location not found'
                });
            }
        }

        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            { placeName, capacity, location },
            { new: true, runValidators: true }
        ).populate([
            { path: 'location', select: 'name code' },
            { path: 'createdBy', select: 'name email role' }
        ]);

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            data: venue
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete venue
export const deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndDelete(req.params.id);

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venue deleted successfully',
            data: venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
