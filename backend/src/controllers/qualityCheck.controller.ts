import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all quality checks with filtering and pagination
 * @route GET /api/v1/quality-checks
 * @access Private - Admin, Manager, QualityManager
 */
export const getAllQualityChecks = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const {
      productionStageId,
      productionOrderId,
      passed,
      startDate,
      endDate,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('production_quality_checks')
      .select(`
        *,
        production_stage:production_stage_id(
          id, 
          name, 
          production_order_id
        ),
        checked_by_user:checked_by(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    // Apply filters
    if (productionStageId) {
      query = query.eq('production_stage_id', productionStageId);
    }

    if (passed !== undefined) {
      query = query.eq('passed', passed === 'true');
    }

    if (startDate) {
      query = query.gte('check_date', startDate);
    }

    if (endDate) {
      query = query.lte('check_date', endDate);
    }

    // If production order ID is provided, we need to join with production_stages
    if (productionOrderId) {
      // First, get all stages for this order
      const { data: stages, error: stagesError } = await supabase
        .from('production_stages')
        .select('id')
        .eq('production_order_id', productionOrderId)
        .eq('status', true);

      if (stagesError) {
        console.error('Error fetching production stages:', stagesError);
        return res.status(500).json({ message: 'Failed to fetch production stages', error: stagesError });
      }

      if (stages && stages.length > 0) {
        const stageIds = stages.map(stage => stage.id);
        query = query.in('production_stage_id', stageIds);
      } else {
        // If no stages found, return empty result
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          page: Number(page),
          limit: Number(limit),
          totalPages: 0
        });
      }
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    // Apply sorting
    if (sort && order) {
      query = query.order(sort as string, { ascending: order === 'asc' });
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('Error fetching quality checks:', error);
      return res.status(500).json({ message: 'Failed to fetch quality checks', error });
    }

    return res.status(200).json({
      success: true,
      count,
      data,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit))
    });
  } catch (error) {
    console.error('Error in getAllQualityChecks:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get quality check by ID
 * @route GET /api/v1/quality-checks/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const getQualityCheckById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { data, error } = await supabase
      .from('production_quality_checks')
      .select(`
        *,
        production_stage:production_stage_id(
          id, 
          name, 
          production_order_id,
          production_order:production_order_id(
            id, 
            name, 
            product_id,
            product:product_id(
              id,
              name,
              sku
            )
          )
        ),
        checked_by_user:checked_by(
          id,
          email,
          first_name,
          last_name
        ),
        quality_check_items(*)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      console.error('Error fetching quality check:', error);
      return res.status(404).json({ message: 'Quality check not found', error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getQualityCheckById:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Create a new quality check
 * @route POST /api/v1/quality-checks
 * @access Private - Admin, Manager, QualityManager
 */
export const createQualityCheck = async (req: Request, res: Response) => {
  try {
    const {
      production_stage_id,
      notes,
      passed,
      check_items = []
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id, stage_status, quality_check_required, company_id')
      .eq('id', production_stage_id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Check if quality check is required for this stage
    if (!stageData.quality_check_required) {
      return res.status(400).json({ message: 'Quality check is not required for this stage' });
    }

    // Only allow quality checks for stages that are in_progress
    if (stageData.stage_status !== 'in_progress') {
      return res.status(400).json({
        message: `Cannot perform quality check on stage with status '${stageData.stage_status}'. Stage must be in progress.`
      });
    }

    // Create the quality check
    const { data: qualityCheck, error } = await supabase
      .from('production_quality_checks')
      .insert({
        production_stage_id,
        checked_by: userId,
        check_date: new Date(),
        passed,
        notes,
        status: true,
        company_id: companyId,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quality check:', error);
      return res.status(500).json({ message: 'Failed to create quality check', error });
    }

    // If check items are provided, create them
    if (check_items.length > 0) {
      const checkItemsData = check_items.map(item => ({
        quality_check_id: qualityCheck.id,
        parameter: item.parameter,
        expected_value: item.expected_value,
        actual_value: item.actual_value,
        unit_of_measure: item.unit_of_measure,
        passed: item.passed,
        notes: item.notes,
        status: true,
        company_id: companyId,
        created_by: userId
      }));

      const { error: checkItemsError } = await supabase
        .from('quality_check_items')
        .insert(checkItemsData);

      if (checkItemsError) {
        console.error('Error creating quality check items:', checkItemsError);
        // Don't fail the entire operation, just log the error
      }
    }

    // Update the stage with quality approval if the check passed
    if (passed) {
      await supabase
        .from('production_stages')
        .update({
          quality_approved: true,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('id', production_stage_id);
    }

    return res.status(201).json({
      success: true,
      message: 'Quality check created successfully',
      data: qualityCheck
    });
  } catch (error) {
    console.error('Error in createQualityCheck:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update a quality check
 * @route PUT /api/v1/quality-checks/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const updateQualityCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, passed } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if quality check exists
    const { data: checkData, error: checkError } = await supabase
      .from('production_quality_checks')
      .select('id, production_stage_id, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (checkError || !checkData) {
      return res.status(404).json({ message: 'Quality check not found', error: checkError });
    }

    // If companyId is set, check if user has access to this check
    if (companyId && checkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this quality check' });
    }

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date()
    };

    // Only include fields that are provided
    if (notes !== undefined) updateData.notes = notes;
    if (passed !== undefined) updateData.passed = passed;

    const { data, error } = await supabase
      .from('production_quality_checks')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating quality check:', error);
      return res.status(500).json({ message: 'Failed to update quality check', error });
    }

    // Update the stage with quality approval if the check passed
    if (passed !== undefined) {
      await supabase
        .from('production_stages')
        .update({
          quality_approved: passed,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('id', checkData.production_stage_id);
    }

    return res.status(200).json({
      success: true,
      message: 'Quality check updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateQualityCheck:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Delete a quality check (soft delete)
 * @route DELETE /api/v1/quality-checks/:id
 * @access Private - Admin
 */
export const deleteQualityCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if quality check exists
    const { data: checkData, error: checkError } = await supabase
      .from('production_quality_checks')
      .select('id, company_id, production_stage_id, passed')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (checkError || !checkData) {
      return res.status(404).json({ message: 'Quality check not found', error: checkError });
    }

    // If companyId is set, check if user has access to this check
    if (companyId && checkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this quality check' });
    }

    // Soft delete quality check items first
    const { error: itemsDeleteError } = await supabase
      .from('quality_check_items')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('quality_check_id', id);

    if (itemsDeleteError) {
      console.error('Error deleting quality check items:', itemsDeleteError);
      return res.status(500).json({ message: 'Failed to delete quality check items', error: itemsDeleteError });
    }

    // Soft delete the quality check
    const { error: deleteError } = await supabase
      .from('production_quality_checks')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error deleting quality check:', deleteError);
      return res.status(500).json({ message: 'Failed to delete quality check', error: deleteError });
    }

    // If the check was passed, reset the quality_approved flag on the stage
    if (checkData.passed) {
      await supabase
        .from('production_stages')
        .update({
          quality_approved: null,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('id', checkData.production_stage_id);
    }

    return res.status(200).json({
      success: true,
      message: 'Quality check deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteQualityCheck:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get quality checks for a production stage
 * @route GET /api/v1/quality-checks/stage/:stageId
 * @access Private - Admin, Manager, QualityManager
 */
export const getQualityChecksByStage = async (req: Request, res: Response) => {
  try {
    const { stageId } = req.params;
    const companyId = req.user?.companyId;
    const { page = 1, limit = 20 } = req.query;

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, company_id')
      .eq('id', stageId)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    // Get quality checks for the stage
    const { data, count, error } = await supabase
      .from('production_quality_checks')
      .select(`
        *,
        checked_by_user:checked_by(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('production_stage_id', stageId)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('check_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching quality checks:', error);
      return res.status(500).json({ message: 'Failed to fetch quality checks', error });
    }

    return res.status(200).json({
      success: true,
      count,
      data,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit))
    });
  } catch (error) {
    console.error('Error in getQualityChecksByStage:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get quality checks for a production order
 * @route GET /api/v1/quality-checks/order/:orderId
 * @access Private - Admin, Manager, QualityManager
 */
export const getQualityChecksByOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const companyId = req.user?.companyId;
    const { page = 1, limit = 20 } = req.query;

    // Check if order exists
    const { data: orderData, error: orderError } = await supabase
      .from('production_orders')
      .select('id, company_id')
      .eq('id', orderId)
      .eq('status', true)
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ message: 'Production order not found', error: orderError });
    }

    // If companyId is set, check if user has access to this order
    if (companyId && orderData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production order' });
    }

    // First, get all stages for this order
    const { data: stages, error: stagesError } = await supabase
      .from('production_stages')
      .select('id')
      .eq('production_order_id', orderId)
      .eq('status', true);

    if (stagesError) {
      console.error('Error fetching production stages:', stagesError);
      return res.status(500).json({ message: 'Failed to fetch production stages', error: stagesError });
    }

    if (!stages || stages.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        page: Number(page),
        limit: Number(limit),
        totalPages: 0
      });
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const stageIds = stages.map(stage => stage.id);

    // Get quality checks for all stages in the order
    const { data, count, error } = await supabase
      .from('production_quality_checks')
      .select(`
        *,
        production_stage:production_stage_id(
          id, 
          name
        ),
        checked_by_user:checked_by(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .in('production_stage_id', stageIds)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('check_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching quality checks:', error);
      return res.status(500).json({ message: 'Failed to fetch quality checks', error });
    }

    return res.status(200).json({
      success: true,
      count,
      data,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit))
    });
  } catch (error) {
    console.error('Error in getQualityChecksByOrder:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Add or update quality check items
 * @route POST /api/v1/quality-checks/:id/items
 * @access Private - Admin, Manager, QualityManager
 */
export const updateQualityCheckItems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    // Check if quality check exists
    const { data: checkData, error: checkError } = await supabase
      .from('production_quality_checks')
      .select('id, company_id, production_stage_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (checkError || !checkData) {
      return res.status(404).json({ message: 'Quality check not found', error: checkError });
    }

    // If companyId is set, check if user has access to this check
    if (companyId && checkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this quality check' });
    }

    // Process each item: update existing or create new
    const results = [];
    let allPassed = true;

    for (const item of items) {
      const itemData = {
        quality_check_id: id,
        parameter: item.parameter,
        expected_value: item.expected_value,
        actual_value: item.actual_value,
        unit_of_measure: item.unit_of_measure,
        passed: item.passed,
        notes: item.notes,
        status: true,
        company_id: companyId,
        created_by: userId,
        updated_by: userId,
        updated_at: new Date()
      };

      if (!item.passed) {
        allPassed = false;
      }

      if (item.id) {
        // Update existing item
        const { data, error } = await supabase
          .from('quality_check_items')
          .update(itemData)
          .eq('id', item.id)
          .eq('quality_check_id', id)
          .select();

        if (error) {
          console.error('Error updating quality check item:', error);
          return res.status(500).json({ message: 'Failed to update quality check item', error });
        }

        results.push(data);
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('quality_check_items')
          .insert(itemData)
          .select();

        if (error) {
          console.error('Error creating quality check item:', error);
          return res.status(500).json({ message: 'Failed to create quality check item', error });
        }

        results.push(data);
      }
    }

    // Update the overall quality check passed status based on all items
    await supabase
      .from('production_quality_checks')
      .update({
        passed: allPassed,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id);

    // Update the stage quality approval status
    await supabase
      .from('production_stages')
      .update({
        quality_approved: allPassed,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', checkData.production_stage_id);

    return res.status(200).json({
      success: true,
      message: 'Quality check items updated successfully',
      data: results,
      passed: allPassed
    });
  } catch (error) {
    console.error('Error in updateQualityCheckItems:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Delete a quality check item
 * @route DELETE /api/v1/quality-checks/:checkId/items/:itemId
 * @access Private - Admin, Manager, QualityManager
 */
export const deleteQualityCheckItem = async (req: Request, res: Response) => {
  try {
    const { checkId, itemId } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if quality check exists
    const { data: checkData, error: checkError } = await supabase
      .from('production_quality_checks')
      .select('id, company_id, production_stage_id')
      .eq('id', checkId)
      .eq('status', true)
      .single();

    if (checkError || !checkData) {
      return res.status(404).json({ message: 'Quality check not found', error: checkError });
    }

    // If companyId is set, check if user has access to this check
    if (companyId && checkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this quality check' });
    }

    // Soft delete the quality check item
    const { error: deleteError } = await supabase
      .from('quality_check_items')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', itemId)
      .eq('quality_check_id', checkId);

    if (deleteError) {
      console.error('Error deleting quality check item:', deleteError);
      return res.status(404).json({ message: 'Quality check item not found or already deleted', error: deleteError });
    }

    // Get remaining items to update the overall check status
    const { data: remainingItems, error: itemsError } = await supabase
      .from('quality_check_items')
      .select('passed')
      .eq('quality_check_id', checkId)
      .eq('status', true);

    if (!itemsError && remainingItems) {
      const allPassed = remainingItems.length > 0 && remainingItems.every(item => item.passed);

      // Update the overall quality check passed status
      await supabase
        .from('production_quality_checks')
        .update({
          passed: allPassed,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('id', checkId);

      // Update the stage quality approval status
      await supabase
        .from('production_stages')
        .update({
          quality_approved: allPassed,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('id', checkData.production_stage_id);
    }

    return res.status(200).json({
      success: true,
      message: 'Quality check item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteQualityCheckItem:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};