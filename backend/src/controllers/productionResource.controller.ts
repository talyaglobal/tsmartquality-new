import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all production resources
 * @route GET /api/v1/production-resources
 * @access Private - Admin, Manager, QualityManager
 */
export const getAllProductionResources = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { 
      name, 
      type, 
      sort = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('production_resources')
      .select('*', { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (type) {
      query = query.eq('resource_type', type);
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
      console.error('Error fetching production resources:', error);
      return res.status(500).json({ message: 'Failed to fetch production resources', error });
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
    console.error('Error in getAllProductionResources:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get production resource by ID
 * @route GET /api/v1/production-resources/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const getProductionResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { data, error } = await supabase
      .from('production_resources')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      console.error('Error fetching production resource:', error);
      return res.status(404).json({ message: 'Production resource not found', error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getProductionResourceById:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Create a new production resource
 * @route POST /api/v1/production-resources
 * @access Private - Admin, Manager
 */
export const createProductionResource = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      resource_type,
      capacity,
      unit_of_measure,
      cost_per_unit,
      location_id
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // If location_id is provided, check if it exists and belongs to the company
    if (location_id) {
      const { data: locationData, error: locationError } = await supabase
        .from('warehouse_locations')
        .select('id, company_id')
        .eq('id', location_id)
        .eq('status', true)
        .single();

      if (locationError || !locationData) {
        return res.status(404).json({ message: 'Location not found', error: locationError });
      }

      // If companyId is set, check if user has access to this location
      if (companyId && locationData.company_id !== companyId) {
        return res.status(403).json({ message: 'You do not have access to this location' });
      }
    }

    const { data, error } = await supabase
      .from('production_resources')
      .insert({
        name,
        description,
        resource_type,
        capacity,
        unit_of_measure,
        cost_per_unit,
        location_id,
        status: true,
        company_id: companyId,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating production resource:', error);
      return res.status(500).json({ message: 'Failed to create production resource', error });
    }

    return res.status(201).json({
      success: true,
      message: 'Production resource created successfully',
      data
    });
  } catch (error) {
    console.error('Error in createProductionResource:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update a production resource
 * @route PUT /api/v1/production-resources/:id
 * @access Private - Admin, Manager
 */
export const updateProductionResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      resource_type,
      capacity,
      unit_of_measure,
      cost_per_unit,
      location_id,
      availability_status
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if resource exists
    const { data: resourceData, error: resourceError } = await supabase
      .from('production_resources')
      .select('id, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (resourceError || !resourceData) {
      return res.status(404).json({ message: 'Production resource not found', error: resourceError });
    }

    // If companyId is set, check if user has access to this resource
    if (companyId && resourceData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production resource' });
    }

    // If location_id is provided, check if it exists and belongs to the company
    if (location_id) {
      const { data: locationData, error: locationError } = await supabase
        .from('warehouse_locations')
        .select('id, company_id')
        .eq('id', location_id)
        .eq('status', true)
        .single();

      if (locationError || !locationData) {
        return res.status(404).json({ message: 'Location not found', error: locationError });
      }

      // If companyId is set, check if user has access to this location
      if (companyId && locationData.company_id !== companyId) {
        return res.status(403).json({ message: 'You do not have access to this location' });
      }
    }

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date()
    };

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (resource_type !== undefined) updateData.resource_type = resource_type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (unit_of_measure !== undefined) updateData.unit_of_measure = unit_of_measure;
    if (cost_per_unit !== undefined) updateData.cost_per_unit = cost_per_unit;
    if (location_id !== undefined) updateData.location_id = location_id;
    if (availability_status !== undefined) updateData.availability_status = availability_status;

    const { data, error } = await supabase
      .from('production_resources')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating production resource:', error);
      return res.status(500).json({ message: 'Failed to update production resource', error });
    }

    return res.status(200).json({
      success: true,
      message: 'Production resource updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateProductionResource:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Delete a production resource (soft delete)
 * @route DELETE /api/v1/production-resources/:id
 * @access Private - Admin, Manager
 */
export const deleteProductionResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if resource exists
    const { data: resourceData, error: resourceError } = await supabase
      .from('production_resources')
      .select('id, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (resourceError || !resourceData) {
      return res.status(404).json({ message: 'Production resource not found', error: resourceError });
    }

    // If companyId is set, check if user has access to this resource
    if (companyId && resourceData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production resource' });
    }

    // Check if resource is used in any active production stage
    const { count, error: stageResourceError } = await supabase
      .from('production_stage_resources')
      .select('*', { count: 'exact', head: true })
      .eq('resource_id', id)
      .eq('status', true);

    if (stageResourceError) {
      console.error('Error checking resource usage:', stageResourceError);
      return res.status(500).json({ message: 'Error checking resource usage', error: stageResourceError });
    }

    if (count && count > 0) {
      return res.status(400).json({
        message: 'Cannot delete resource: It is currently in use in production stages',
        usageCount: count
      });
    }

    // Soft delete the resource
    const { error: deleteError } = await supabase
      .from('production_resources')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error deleting production resource:', deleteError);
      return res.status(500).json({ message: 'Failed to delete production resource', error: deleteError });
    }

    return res.status(200).json({
      success: true,
      message: 'Production resource deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProductionResource:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get all resource types
 * @route GET /api/v1/production-resources/types
 * @access Private - Admin, Manager, QualityManager
 */
export const getResourceTypes = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    // Get distinct resource types from the company's resources
    let query = supabase
      .from('production_resources')
      .select('resource_type')
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('resource_type');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resource types:', error);
      return res.status(500).json({ message: 'Failed to fetch resource types', error });
    }

    // Extract unique resource types
    const types = [...new Set(data.map(item => item.resource_type))];

    return res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error in getResourceTypes:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update resource availability
 * @route PUT /api/v1/production-resources/:id/availability
 * @access Private - Admin, Manager
 */
export const updateResourceAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availability_status, reason } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Validate availability status
    const validStatuses = ['available', 'maintenance', 'reserved', 'inactive'];
    if (!validStatuses.includes(availability_status)) {
      return res.status(400).json({
        message: `Invalid availability status. Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if resource exists
    const { data: resourceData, error: resourceError } = await supabase
      .from('production_resources')
      .select('id, company_id, availability_status')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (resourceError || !resourceData) {
      return res.status(404).json({ message: 'Production resource not found', error: resourceError });
    }

    // If companyId is set, check if user has access to this resource
    if (companyId && resourceData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production resource' });
    }

    // Update resource availability
    const { data, error } = await supabase
      .from('production_resources')
      .update({
        availability_status,
        availability_reason: reason,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating resource availability:', error);
      return res.status(500).json({ message: 'Failed to update resource availability', error });
    }

    // Log the availability change
    await supabase
      .from('production_resource_availability_logs')
      .insert({
        resource_id: id,
        previous_status: resourceData.availability_status,
        new_status: availability_status,
        reason,
        company_id: companyId,
        created_by: userId
      });

    return res.status(200).json({
      success: true,
      message: 'Resource availability updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateResourceAvailability:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get resource availability history
 * @route GET /api/v1/production-resources/:id/availability-history
 * @access Private - Admin, Manager, QualityManager
 */
export const getResourceAvailabilityHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const { page = 1, limit = 20 } = req.query;

    // Check if resource exists
    const { data: resourceData, error: resourceError } = await supabase
      .from('production_resources')
      .select('id, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (resourceError || !resourceData) {
      return res.status(404).json({ message: 'Production resource not found', error: resourceError });
    }

    // If companyId is set, check if user has access to this resource
    if (companyId && resourceData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production resource' });
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    // Get availability history
    const { data, count, error } = await supabase
      .from('production_resource_availability_logs')
      .select('*', { count: 'exact' })
      .eq('resource_id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching resource availability history:', error);
      return res.status(500).json({ message: 'Failed to fetch resource availability history', error });
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
    console.error('Error in getResourceAvailabilityHistory:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};