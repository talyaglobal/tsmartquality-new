import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { body, param, query } from 'express-validator';
import * as photoController from '../controllers/photo.controller';

const router = Router();

/**
 * @swagger
 * /api/photos:
 *   get:
 *     summary: Get all photos with optional filtering
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *     responses:
 *       200:
 *         description: A list of photos
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    query('productId').optional().isUUID().withMessage('Product ID must be a valid UUID')
  ]),
  photoController.getAllPhotos
);

/**
 * @swagger
 * /api/photos/{id}:
 *   get:
 *     summary: Get a photo by ID
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo details
 *       404:
 *         description: Photo not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id',
  authenticate,
  validate([
    param('id').isUUID().withMessage('Photo ID must be a valid UUID')
  ]),
  photoController.getPhotoById
);

/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Upload a new photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The photo file to upload
 *       - in: formData
 *         name: productId
 *         type: string
 *         description: Product ID to associate with the photo
 *       - in: formData
 *         name: title
 *         type: string
 *         description: Photo title
 *       - in: formData
 *         name: description
 *         type: string
 *         description: Photo description
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  uploadMiddleware.single('file'),
  validate([
    body('productId').optional().isUUID().withMessage('Product ID must be a valid UUID'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string')
  ]),
  photoController.uploadPhoto
);

/**
 * @swagger
 * /api/photos:
 *   put:
 *     summary: Update photo details
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Photo ID
 *               title:
 *                 type: string
 *                 description: Photo title
 *               description:
 *                 type: string
 *                 description: Photo description
 *               productId:
 *                 type: string
 *                 description: Product ID to associate with the photo
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Photo not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/',
  authenticate,
  validate([
    body('id').isUUID().withMessage('Photo ID must be a valid UUID'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('productId').optional().isUUID().withMessage('Product ID must be a valid UUID')
  ]),
  photoController.updatePhoto
);

/**
 * @swagger
 * /api/photos/{id}:
 *   delete:
 *     summary: Delete a photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       404:
 *         description: Photo not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id',
  authenticate,
  validate([
    param('id').isUUID().withMessage('Photo ID must be a valid UUID')
  ]),
  photoController.deletePhoto
);

/**
 * @swagger
 * /api/photos/product/{productId}:
 *   get:
 *     summary: Get photos by product ID
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: A list of photos for the product
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/product/:productId',
  authenticate,
  validate([
    param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  photoController.getPhotosByProductId
);

/**
 * @swagger
 * /api/photos/associate:
 *   post:
 *     summary: Associate a photo with a product
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photoId
 *               - productId
 *             properties:
 *               photoId:
 *                 type: string
 *                 description: Photo ID
 *               productId:
 *                 type: string
 *                 description: Product ID to associate with the photo
 *     responses:
 *       200:
 *         description: Photo associated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Photo or product not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/associate',
  authenticate,
  validate([
    body('photoId').isUUID().withMessage('Photo ID must be a valid UUID'),
    body('productId').isUUID().withMessage('Product ID must be a valid UUID')
  ]),
  photoController.associatePhotoWithProduct
);

export default router;
