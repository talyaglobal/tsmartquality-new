import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all warehouse shelves
export const getAllWarehouseShelves = async (req: Request, res: Response) => {
  try {
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse shelves:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse shelves by warehouse ID
export const getShelvesByWarehouseId = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .select(`
        *,
        location:location_id(id, name, code)
      `)
      .eq('warehouse_id', warehouseId)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .order('name');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse shelves by warehouse ID:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse shelves by location ID
export const getShelvesByLocationId = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .select('*')
      .eq('location_id', locationId)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .order('shelf_level, shelf_position');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse shelves by location ID:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse shelf by ID
export const getWarehouseShelfById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse shelf not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse shelf:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new warehouse shelf
export const createWarehouseShelf = async (req: Request, res: Response) => {
  try {
    const shelfData = req.body;
    
    // Add user data
    shelfData.created_by = req.user?.id;
    shelfData.company_id = req.user?.companyId;
    shelfData.status = true;
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .insert(shelfData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating warehouse shelf:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a warehouse shelf
export const updateWarehouseShelf = async (req: Request, res: Response) => {
  try {
    const shelfData = req.body;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    // Add user data for update
    shelfData.updated_by = req.user?.id;
    shelfData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .update(shelfData)
      .eq('id', shelfData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating warehouse shelf:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a warehouse shelf (soft delete)
export const deleteWarehouseShelf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('warehouse_shelves')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id') // Multi-tenancy filter
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: 'Warehouse shelf deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting warehouse shelf:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get paginated warehouse shelves
export const getPaginatedShelves = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    const warehouseId = req.query.warehouseId as string;
    const locationId = req.query.locationId as string;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouse_shelves')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code)
      `, { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id'); // Multi-tenancy filter
    
    // Apply filters if provided
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    // Get total count
    const { count: totalCount, error: countError } = await query;
      
    if (countError) throw countError;
    
    // Get paginated data
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      totalCount,
      items: data,
      offset,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching paginated warehouse shelves:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered warehouse shelves
export const getFilteredShelves = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    const { 
      searchTerm, 
      warehouseId,
      locationId,
      shelfLevel,
      isBlocked,
      isActive
    } = req.query;
    // Get company ID from authenticated user for multi-tenancy
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouse_shelves')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code)
      `, { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id'); // Multi-tenancy filter
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,shelf_position.ilike.%${searchTerm}%`);
    }
    
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    if (shelfLevel) {
      query = query.eq('shelf_level', shelfLevel);
    }
    
    if (isBlocked !== undefined) {
      query = query.eq('is_blocked', isBlocked === 'true');
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }
    
    // Get total count with filters
    const { count: totalCount, error: countError } = await query;
      
    if (countError) throw countError;
    
    // Get paginated data with filters
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      totalCount,
      items: data,
      offset,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching filtered warehouse shelves:', error);
    return res.status(500).json({ message: error.message });
  }
};