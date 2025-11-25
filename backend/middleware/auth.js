import User from '../src/user/userModel.js';
import Venue from '../src/venue/venueModel.js';

/**
 * Middleware to authenticate user from request headers
 * Extracts user ID from x-user-id header and populates req.user
 */
export const authenticateUser = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide x-user-id header'
            });
        }

        const user = await User.findById(userId).populate('location', 'name code');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user has one of the required roles
 * @param {...string} roles - Allowed roles (e.g., 'Admin', 'Organizer')
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware to check if user owns the venue or is an Admin
 * Used for update and delete operations
 */
export const checkVenueOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admins can access any venue
        if (req.user.role === 'Admin') {
            return next();
        }

        // Get venue ID from request params
        const venueId = req.params.id;

        if (!venueId) {
            return res.status(400).json({
                success: false,
                message: 'Venue ID is required'
            });
        }

        const venue = await Venue.findById(venueId);

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if user created this venue
        if (venue.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify venues you created'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed',
            error: error.message
        });
    }
};
