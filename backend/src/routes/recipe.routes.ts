import express, { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as recipeController from '../controllers/recipe.controller';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The recipe ID
 *         code:
 *           type: string
 *           description: Recipe code
 *         name:
 *           type: string
 *           description: Recipe name
 *         description:
 *           type: string
 *           description: Recipe description
 *         product_id:
 *           type: integer
 *           description: Product ID this recipe belongs to
 *         semi_product_id:
 *           type: integer
 *           description: Semi-product ID this recipe belongs to
 *         total_quantity:
 *           type: number
 *           description: Total recipe quantity
 *         company_id:
 *           type: integer
 *           description: Company ID
 *         status:
 *           type: boolean
 *           description: Recipe status
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
 *           description: User ID who created the recipe
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: User ID who updated the recipe
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
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
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
router.get(
  '/',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  recipeController.getAllRecipes
);

/**
 * @swagger
 * /api/recipes/all-with-details:
 *   get:
 *     summary: Get all recipes with their details
 *     tags: [Recipes]
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
 *     responses:
 *       200:
 *         description: List of recipes with details
 */
router.get(
  '/all-with-details',
  authenticate,
  validate([
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  recipeController.getAllRecipesWithDetails
);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  recipeController.getRecipeById
);

/**
 * @swagger
 * /api/recipes/with-details/{recipeId}:
 *   get:
 *     summary: Get a recipe with its details
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe with details
 *       404:
 *         description: Recipe not found
 */
router.get(
  '/with-details/:recipeId',
  authenticate,
  validate([param('recipeId').isInt().withMessage('Recipe ID must be an integer')]),
  recipeController.getRecipeWithDetails
);

/**
 * @swagger
 * /api/recipes/product/{productId}:
 *   get:
 *     summary: Get recipes by product ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of recipes for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
router.get(
  '/product/:productId',
  authenticate,
  validate([param('productId').isInt().withMessage('Product ID must be an integer')]),
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      const { data, error, count } = await req.supabase
        .from('recipes')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .eq('company_id', req.user.company_id)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
      
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      
      return res.status(200).json({
        success: true,
        data,
        count,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error: any) {
      console.error('Error fetching recipes by product:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               product_id:
 *                 type: integer
 *               semi_product_id:
 *                 type: integer
 *               total_quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Recipe created successfully
 */
router.post(
  '/',
  authenticate,
  validate([
    body('code').notEmpty().withMessage('Code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi-product ID must be an integer'),
    body('total_quantity').optional().isNumeric().withMessage('Total quantity must be a number')
  ]),
  recipeController.createRecipe
);

/**
 * @swagger
 * /api/recipes:
 *   put:
 *     summary: Update a recipe
 *     tags: [Recipes]
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
 *                 type: integer
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               product_id:
 *                 type: integer
 *               semi_product_id:
 *                 type: integer
 *               total_quantity:
 *                 type: number
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 */
router.put(
  '/',
  authenticate,
  validate([
    body('id').isInt().withMessage('ID is required and must be an integer'),
    body('code').optional().isString(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('product_id').optional().isInt().withMessage('Product ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi-product ID must be an integer'),
    body('total_quantity').optional().isNumeric().withMessage('Total quantity must be a number'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean')
  ]),
  recipeController.updateRecipe
);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID to delete
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 */
router.delete(
  '/:id',
  authenticate,
  validate([param('id').isInt().withMessage('ID must be an integer')]),
  recipeController.deleteRecipe
);

/**
 * @swagger
 * /api/recipes/details/{recipeId}:
 *   get:
 *     summary: Get all recipe details for a recipe
 *     tags: [RecipeDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: A list of recipe details
 *       404:
 *         description: Recipe not found
 */
router.get(
  '/details/:recipeId',
  authenticate,
  validate([
    param('recipeId').isInt().withMessage('Recipe ID must be an integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ]),
  recipeController.getRecipeDetails
);

/**
 * @swagger
 * /api/recipes/details/item/{id}:
 *   get:
 *     summary: Get a recipe detail by ID
 *     tags: [RecipeDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe detail ID
 *     responses:
 *       200:
 *         description: Recipe detail
 *       404:
 *         description: Recipe detail not found
 */
router.get(
  '/details/item/:id',
  authenticate,
  validate([param('id').isInt().withMessage('Recipe detail ID must be an integer')]),
  recipeController.getRecipeDetailById
);

/**
 * @swagger
 * /api/recipes/details:
 *   post:
 *     summary: Create a new recipe detail
 *     tags: [RecipeDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe_id
 *               - quantity
 *               - unit
 *             properties:
 *               recipe_id:
 *                 type: integer
 *               raw_material_id:
 *                 type: integer
 *               semi_product_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               sequence:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Recipe detail created successfully
 */
router.post(
  '/details',
  authenticate,
  validate([
    body('recipe_id').isInt().withMessage('Recipe ID must be an integer'),
    body('raw_material_id').optional().isInt().withMessage('Raw material ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi-product ID must be an integer'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').isString().notEmpty().withMessage('Unit is required'),
    body('sequence').optional().isInt().withMessage('Sequence must be an integer')
  ]),
  recipeController.createRecipeDetail
);

/**
 * @swagger
 * /api/recipes/details:
 *   put:
 *     summary: Update a recipe detail
 *     tags: [RecipeDetails]
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
 *               - recipe_id
 *             properties:
 *               id:
 *                 type: integer
 *               recipe_id:
 *                 type: integer
 *               raw_material_id:
 *                 type: integer
 *               semi_product_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               sequence:
 *                 type: integer
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recipe detail updated successfully
 */
router.put(
  '/details',
  authenticate,
  validate([
    body('id').isInt().withMessage('Recipe detail ID must be an integer'),
    body('recipe_id').isInt().withMessage('Recipe ID must be an integer'),
    body('raw_material_id').optional().isInt().withMessage('Raw material ID must be an integer'),
    body('semi_product_id').optional().isInt().withMessage('Semi-product ID must be an integer'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional().isString(),
    body('sequence').optional().isInt().withMessage('Sequence must be an integer'),
    body('status').optional().isBoolean().withMessage('Status must be a boolean')
  ]),
  recipeController.updateRecipeDetail
);

/**
 * @swagger
 * /api/recipes/details/{id}:
 *   delete:
 *     summary: Delete a recipe detail
 *     tags: [RecipeDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Recipe detail ID
 *     responses:
 *       200:
 *         description: Recipe detail deleted successfully
 */
router.delete(
  '/details/:id',
  authenticate,
  validate([param('id').isInt().withMessage('Recipe detail ID must be an integer')]),
  recipeController.deleteRecipeDetail
);

export default router;