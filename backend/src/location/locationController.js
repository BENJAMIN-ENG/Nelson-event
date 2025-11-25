import Location from './locationModel.js';

// Create a new location
export const createLocation = async (req, res) => {
    try {
        const { name, code, parent } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Name and code are required'
            });
        }

        // If parent is provided, verify it exists
        if (parent) {
            const parentLocation = await Location.findById(parent);
            if (!parentLocation) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent location not found'
                });
            }
        }

        const location = await Location.create({ name, code, parent });

        res.status(201).json({
            success: true,
            data: location
        });
    } catch (error) {
        // Handle duplicate code error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Location code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all locations
export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().populate('parent', 'name code');

        res.status(200).json({
            success: true,
            count: locations.length,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get location by ID
export const getLocationById = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).populate('parent', 'name code');

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get locations by parent ID
export const getLocationsByParent = async (req, res) => {
    try {
        const { parentId } = req.params;

        // If parentId is 'root' or 'null', get root locations
        const query = (parentId === 'root' || parentId === 'null')
            ? { parent: null }
            : { parent: parentId };

        const locations = await Location.find(query).populate('parent', 'name code');

        res.status(200).json({
            success: true,
            count: locations.length,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update location
export const updateLocation = async (req, res) => {
    try {
        const { name, code, parent } = req.body;

        // If parent is provided, verify it exists and prevent circular reference
        if (parent) {
            if (parent === req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Location cannot be its own parent'
                });
            }

            const parentLocation = await Location.findById(parent);
            if (!parentLocation) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent location not found'
                });
            }
        }

        const location = await Location.findByIdAndUpdate(
            req.params.id,
            { name, code, parent },
            { new: true, runValidators: true }
        ).populate('parent', 'name code');

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        // Handle duplicate code error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Location code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete location
export const deleteLocation = async (req, res) => {
    try {
        // Check if location has children
        const childrenCount = await Location.countDocuments({ parent: req.params.id });

        if (childrenCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete location with child locations'
            });
        }

        const location = await Location.findByIdAndDelete(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Location deleted successfully',
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
