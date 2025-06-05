import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all production stages
 * @route GET /api/v1/production-stages
 * @access Private - Admin, Manager, QualityManager
 */
export const getAllProductionStages = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { 
      orderId, 
      status, 
      sort = 'sequence_number', 
      order = 'asc', 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('production_stages')
      .select('*, production_order:production_order_id(*)', { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    // Apply filters
    if (orderId) {
      query = query.eq('production_order_id', orderId);
    }

    if (status && status !== 'all') {
      query = query.eq('stage_status', status);
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
      console.error('Error fetching production stages:', error);
      return res.status(500).json({ message: 'Failed to fetch production stages', error });
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
    console.error('Error in getAllProductionStages:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get production stage by ID
 * @route GET /api/v1/production-stages/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const getProductionStageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { data, error } = await supabase
      .from('production_stages')
      .select(`
        *,
        production_order:production_order_id(*),
        resources:production_stage_resources(*)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      console.error('Error fetching production stage:', error);
      return res.status(404).json({ message: 'Production stage not found', error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getProductionStageById:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Create a new production stage
 * @route POST /api/v1/production-stages
 * @access Private - Admin, Manager
 */
export const createProductionStage = async (req: Request, res: Response) => {
  try {
    const {
      production_order_id,
      name,
      description,
      sequence_number,
      estimated_duration,
      instructions,
      quality_check_required,
      resources = []
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if production order exists
    const { data: orderData, error: orderError } = await supabase
      .from('production_orders')
      .select('id, production_plan_id, company_id')
      .eq('id', production_order_id)
      .eq('status', true)
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ message: 'Production order not found', error: orderError });
    }

    // If companyId is set, check if user has access to this order
    if (companyId && orderData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production order' });
    }

    // Start a transaction
    const { data: stage, error } = await supabase
      .from('production_stages')
      .insert({
        production_order_id,
        name,
        description,
        sequence_number,
        estimated_duration,
        instructions,
        quality_check_required,
        stage_status: 'pending',
        status: true,
        company_id: companyId || orderData.company_id,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating production stage:', error);
      return res.status(500).json({ message: 'Failed to create production stage', error });
    }

    // If resources are provided, create stage resources
    if (resources.length > 0) {
      const stageResources = resources.map(resource => ({
        production_stage_id: stage.id,
        resource_id: resource.resource_id,
        resource_type: resource.resource_type,
        quantity: resource.quantity,
        status: true,
        company_id: companyId || orderData.company_id,
        created_by: userId
      }));

      const { error: resourceError } = await supabase
        .from('production_stage_resources')
        .insert(stageResources);

      if (resourceError) {
        console.error('Error creating stage resources:', resourceError);
        // Don't fail the entire operation, just log the error
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Production stage created successfully',
      data: stage
    });
  } catch (error) {
    console.error('Error in createProductionStage:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update a production stage
 * @route PUT /api/v1/production-stages/:id
 * @access Private - Admin, Manager
 */
export const updateProductionStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      sequence_number,
      estimated_duration,
      instructions,
      quality_check_required
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id, stage_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Only allow updates for stages that are not completed or cancelled
    if (['completed', 'cancelled'].includes(stageData.stage_status)) {
      return res.status(400).json({
        message: `Cannot update a stage with status '${stageData.stage_status}'`
      });
    }

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date()
    };

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sequence_number !== undefined) updateData.sequence_number = sequence_number;
    if (estimated_duration !== undefined) updateData.estimated_duration = estimated_duration;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (quality_check_required !== undefined) updateData.quality_check_required = quality_check_required;

    const { data, error } = await supabase
      .from('production_stages')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating production stage:', error);
      return res.status(500).json({ message: 'Failed to update production stage', error });
    }

    return res.status(200).json({
      success: true,
      message: 'Production stage updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateProductionStage:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update production stage status
 * @route PUT /api/v1/production-stages/status/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const updateProductionStageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress = null, quality_approved = null } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id, stage_status, sequence_number, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Validate status transitions
    if (stageData.stage_status === 'completed' && status !== 'cancelled') {
      return res.status(400).json({
        message: `Cannot change status from 'completed' to '${status}'`
      });
    }

    if (stageData.stage_status === 'cancelled') {
      return res.status(400).json({
        message: `Cannot change status of a cancelled stage`
      });
    }

    // Prepare update data
    const updateData: any = {
      stage_status: status,
      updated_by: userId,
      updated_at: new Date()
    };

    // Include progress if provided and valid
    if (progress !== null && status === 'in_progress') {
      updateData.progress = progress;
    }

    // Include quality approval if provided and status is completed
    if (quality_approved !== null && status === 'completed') {
      updateData.quality_approved = quality_approved;
      
      // If quality check is required but not approved, don't allow completion
      if (stageData.quality_check_required && !quality_approved) {
        return res.status(400).json({
          message: 'Cannot complete stage: Quality check required but not approved'
        });
      }
    }

    // Update the stage status
    const { data, error } = await supabase
      .from('production_stages')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating production stage status:', error);
      return res.status(500).json({ message: 'Failed to update production stage status', error });
    }

    // If stage is completed, check if all stages are completed to update order status
    if (status === 'completed') {
      const { data: orderStages, error: orderStagesError } = await supabase
        .from('production_stages')
        .select('id, stage_status')
        .eq('production_order_id', stageData.production_order_id)
        .eq('status', true);

      if (!orderStagesError && orderStages) {
        const allStagesCompleted = orderStages.every(stage => 
          stage.stage_status === 'completed' || stage.stage_status === 'cancelled'
        );

        if (allStagesCompleted) {
          // Update order status to completed
          await supabase
            .from('production_orders')
            .update({
              order_status: 'completed',
              progress: 100,
              updated_by: userId,
              updated_at: new Date()
            })
            .eq('id', stageData.production_order_id);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Production stage status updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateProductionStageStatus:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Delete a production stage (soft delete)
 * @route DELETE /api/v1/production-stages/:id
 * @access Private - Admin, Manager
 */
export const deleteProductionStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id, stage_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Only allow deletion for stages that are pending
    if (stageData.stage_status !== 'pending') {
      return res.status(400).json({
        message: `Cannot delete a stage with status '${stageData.stage_status}'. Only 'pending' stages can be deleted.`
      });
    }

    // Check if there are resources associated with this stage
    const { count: resourceCount, error: resourceError } = await supabase
      .from('production_stage_resources')
      .select('*', { count: 'exact', head: true })
      .eq('production_stage_id', id)
      .eq('status', true);

    if (resourceError) {
      console.error('Error checking stage resources:', resourceError);
      return res.status(500).json({ message: 'Error checking stage resources', error: resourceError });
    }

    // Start a transaction
    // Soft delete resources if they exist
    if (resourceCount && resourceCount > 0) {
      const { error: deleteResourceError } = await supabase
        .from('production_stage_resources')
        .update({
          status: false,
          updated_by: userId,
          updated_at: new Date()
        })
        .eq('production_stage_id', id);

      if (deleteResourceError) {
        console.error('Error deleting stage resources:', deleteResourceError);
        return res.status(500).json({ message: 'Failed to delete stage resources', error: deleteResourceError });
      }
    }

    // Soft delete the stage
    const { error: deleteError } = await supabase
      .from('production_stages')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error deleting production stage:', deleteError);
      return res.status(500).json({ message: 'Failed to delete production stage', error: deleteError });
    }

    return res.status(200).json({
      success: true,
      message: 'Production stage deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProductionStage:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Add resources to a production stage
 * @route POST /api/v1/production-stages/:id/resources
 * @access Private - Admin, Manager
 */
export const addProductionStageResources = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resources } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return res.status(400).json({ message: 'Resources array is required' });
    }

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id, stage_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    // If companyId is set, check if user has access to this stage
    if (companyId && stageData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production stage' });
    }

    // Only allow adding resources for stages that are not completed or cancelled
    if (['completed', 'cancelled'].includes(stageData.stage_status)) {
      return res.status(400).json({
        message: `Cannot add resources to a stage with status '${stageData.stage_status}'`
      });
    }

    // Prepare resources data
    const stageResources = resources.map(resource => ({
      production_stage_id: id,
      resource_id: resource.resource_id,
      resource_type: resource.resource_type,
      quantity: resource.quantity,
      status: true,
      company_id: companyId || stageData.company_id,
      created_by: userId
    }));

    // Add resources
    const { data, error } = await supabase
      .from('production_stage_resources')
      .insert(stageResources)
      .select();

    if (error) {
      console.error('Error adding stage resources:', error);
      return res.status(500).json({ message: 'Failed to add stage resources', error });
    }

    return res.status(201).json({
      success: true,
      message: 'Resources added to production stage successfully',
      data
    });
  } catch (error) {
    console.error('Error in addProductionStageResources:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Remove a resource from a production stage
 * @route DELETE /api/v1/production-stages/:stageId/resources/:resourceId
 * @access Private - Admin, Manager
 */
export const removeProductionStageResource = async (req: Request, res: Response) => {
  try {
    const { stageId, resourceId } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if stage exists
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, stage_status, company_id')
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

    // Only allow removing resources for stages that are not completed or cancelled
    if (['completed', 'cancelled'].includes(stageData.stage_status)) {
      return res.status(400).json({
        message: `Cannot remove resources from a stage with status '${stageData.stage_status}'`
      });
    }

    // Soft delete the resource
    const { error: deleteError } = await supabase
      .from('production_stage_resources')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', resourceId)
      .eq('production_stage_id', stageId)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error removing stage resource:', deleteError);
      return res.status(404).json({ message: 'Resource not found or already removed', error: deleteError });
    }

    return res.status(200).json({
      success: true,
      message: 'Resource removed from production stage successfully'
    });
  } catch (error) {
    console.error('Error in removeProductionStageResource:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};