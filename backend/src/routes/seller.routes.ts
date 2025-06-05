import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The seller ID
 *         name:
 *           type: string
 *           description: Seller name
 *         code:
 *           type: string
 *           description: Seller code
 *         contact_person:
 *           type: string
 *           description: Contact person name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         address:
 *           type: string
 *           description: Seller address
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Seller status
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Update timestamp
 *         created_by:
 *           type: string
 *           format: uuid
 *           description: User ID who created the seller
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the seller
 */

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 */
router.get('/', authenticate, (req: Request, res: Response): void => {
  // This is a placeholder - implement actual controller logic
  res.status(200).json([]);
});

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     summary: Get seller by ID
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       404:
 *         description: Seller not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  (req: Request, res: Response): void => {
    // This is a placeholder - implement actual controller logic
    res.status(200).json({});
  }
);

/**
 * @swagger
 * /api/sellers:
 *   post:
 *     summary: Create a new seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seller'
 *     responses:
 *       201:
 *         description: Seller created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 */
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  (req: Request, res: Response): void => {
    // This is a placeholder - implement actual controller logic
    res.status(201).json({});
  }
);

/**
 * @swagger
 * /api/sellers/update:
 *   put:
 *     summary: Update a seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seller'
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 */
router.put(
  '/update',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('code').optional().isString(),
    body('contact_person').optional().isString(),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('phone').optional().isString(),
    body('address').optional().isString(),
    body('company_id').optional().isInt().withMessage('Company ID must be an integer')
  ]),
  (req: Request, res: Response): void => {
    // This is a placeholder - implement actual controller logic
    res.status(200).json(req.body);
  }
);

/**
 * @swagger
 * /api/sellers/remove/{id}:
 *   get:
 *     summary: Delete a seller (soft delete)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID to delete
 *     responses:
 *       200:
 *         description: Seller deleted successfully
 *       400:
 *         description: Cannot delete seller that is in use
 */
router.delete(
  '/remove/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  (req: Request, res: Response): void => {
    // This is a placeholder - implement actual controller logic
    res.status(200).json({ message: 'Seller deleted successfully' });
  }
);

export default router;
