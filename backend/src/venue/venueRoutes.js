import express from 'express';
import {
    createVenue,
    getAllVenues,
    getVenueById,
    getVenuesByOrganizer,
    getVenuesByLocation,
    updateVenue,
    deleteVenue,
} from './venueController.js';
import { authenticateUser, requireRole, checkVenueOwnership } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/venue:
 *   post:
 *     summary: Create a new venue
 *     description: Create a new venue. Only Admin and Organizer roles can create venues.
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placeName
 *               - capacity
 *               - location
 *             properties:
 *               placeName:
 *                 type: string
 *                 example: Conference Hall A
 *               capacity:
 *                 type: number
 *                 example: 100
 *               location:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Venue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post('/', authenticateUser, requireRole('Admin', 'Organizer'), createVenue);

/**
 * @swagger
 * /api/venue:
 *   get:
 *     summary: Get all venues
 *     description: Get all venues. Organizers see only their venues, Admins and Attendees see all venues.
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *     responses:
 *       200:
 *         description: List of venues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateUser, getAllVenues);

/**
 * @swagger
 * /api/venue/organizer/{organizerId}:
 *   get:
 *     summary: Get venues by organizer
 *     description: Get all venues created by a specific organizer
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer user ID
 *     responses:
 *       200:
 *         description: List of venues created by the organizer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 organizer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: User is not an organizer
 *       404:
 *         description: Organizer not found
 */
router.get('/organizer/:organizerId', authenticateUser, getVenuesByOrganizer);

/**
 * @swagger
 * /api/venue/location/{locationId}:
 *   get:
 *     summary: Get venues by location (includes all child locations recursively)
 *     description: Returns all venues from the specified location and all its child locations. For example, if you query Rwanda, it will return venues from Rwanda, Kigali, Kicukiro, and all other child locations in the hierarchy.
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID (will search this location and all its children)
 *     responses:
 *       200:
 *         description: List of venues at the location and all child locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: Total number of venues found
 *                 locationsSearched:
 *                   type: integer
 *                   example: 3
 *                   description: Number of locations searched (parent + all children)
 *                 location:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Location not found
 */
router.get('/location/:locationId', authenticateUser, getVenuesByLocation);

/**
 * @swagger
 * /api/venue/{id}:
 *   get:
 *     summary: Get venue by ID
 *     description: Get detailed information about a specific venue
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Venue not found
 */
router.get('/:id', authenticateUser, getVenueById);

/**
 * @swagger
 * /api/venue/{id}:
 *   put:
 *     summary: Update venue
 *     description: Update a venue. Organizers can only update their own venues, Admins can update any venue.
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placeName:
 *                 type: string
 *                 example: Updated Conference Hall
 *               capacity:
 *                 type: number
 *                 example: 150
 *               location:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Venue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       403:
 *         description: Forbidden - can only update own venues
 *       404:
 *         description: Venue not found
 */
router.put('/:id', authenticateUser, checkVenueOwnership, updateVenue);

/**
 * @swagger
 * /api/venue/{id}:
 *   delete:
 *     summary: Delete venue
 *     description: Delete a venue. Organizers can only delete their own venues, Admins can delete any venue.
 *     tags: [Venue]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Venue deleted successfully
 *                 data:
 *                   type: object
 *       403:
 *         description: Forbidden - can only delete own venues
 *       404:
 *         description: Venue not found
 */
router.delete('/:id', authenticateUser, checkVenueOwnership, deleteVenue);

export default router;
