import express from 'express';
import {
    createLocation,
    getAllLocations,
    getLocationById,
    getLocationsByParent,
    updateLocation,
    deleteLocation,
} from './locationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/location:
 *   post:
 *     summary: Create a new location
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationInput'
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createLocation);

/**
 * @swagger
 * /api/location:
 *   get:
 *     summary: Get all locations
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: List of all locations
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
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 */
router.get('/', getAllLocations);

/**
 * @swagger
 * /api/location/parent/{parentId}:
 *   get:
 *     summary: Get locations by parent ID
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent location ID (use 'root' or 'null' for root locations)
 *     responses:
 *       200:
 *         description: List of child locations
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
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 */
router.get('/parent/:parentId', getLocationsByParent);

/**
 * @swagger
 * /api/location/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getLocationById);

/**
 * @swagger
 * /api/location/{id}:
 *   put:
 *     summary: Update location
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationInput'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', updateLocation);

/**
 * @swagger
 * /api/location/{id}:
 *   delete:
 *     summary: Delete location
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location deleted successfully
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
 *                   example: Location deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Cannot delete location with children
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', deleteLocation);

export default router;
