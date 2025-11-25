import User from './userModel.js';
import Location from '../location/locationModel.js';

// Create a new user
export const createUser = async (req, res) => {
    try {
        const { name, phone, email, role, location } = req.body;

        // Validate required fields
        if (!name || !phone || !email || !role || !location) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, phone, email, role, and location'
            });
        }

        const user = await User.create({ name, phone, email, role, location });

        // Populate location details
        await user.populate('location', 'name code');

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

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

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('location', 'name code');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('location', 'name code');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        // Validate role
        const validRoles = ['Admin', 'Organizer', 'Attend'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be Admin, Organizer, or Attend'
            });
        }

        const users = await User.find({ role }).populate('location', 'name code');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
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

// Get users by location (includes all child locations recursively)
export const getUsersByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;

        // Get all location IDs (parent + all descendants)
        const allLocationIds = await getAllChildLocationIds(locationId);

        // Find all users in these locations
        const users = await User.find({
            location: { $in: allLocationIds }
        }).populate('location', 'name code');

        res.status(200).json({
            success: true,
            count: users.length,
            locationsSearched: allLocationIds.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { name, phone, email, role, location } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, email, role, location },
            { new: true, runValidators: true }
        ).populate('location', 'name code');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

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

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
