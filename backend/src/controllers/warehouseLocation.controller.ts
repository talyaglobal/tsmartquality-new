import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all warehouse locations
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .select('*')
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse locations:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse location by ID
export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse location not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse location:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new warehouse location
export const createLocation = async (req: Request, res: Response) => {
  try {
    const locationData = req.body;
    
    // Add user data
    locationData.created_by = req.user?.id;
    locationData.company_id = req.user?.companyId;
    locationData.status = true;
    
    // Validate warehouse existence and company ID
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', locationData.warehouse_id)
      .eq('status', true)
      .eq(locationData.company_id ? 'company_id' : 'id', locationData.company_id || 'id')
      .single();
    
    if (warehouseError) {
      if (warehouseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to add locations to it' });
      }
      throw warehouseError;
    }
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .insert(locationData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating warehouse location:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a warehouse location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const locationData = req.body;
    const companyId = req.user?.companyId;
    
    // Add user data for update
    locationData.updated_by = req.user?.id;
    locationData.updated_at = new Date();
    
    // Check if location exists and belongs to the company
    const { data: existingLocation, error: checkError } = await supabase
      .from('warehouse_locations')
      .select('id')
      .eq('id', locationData.id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse location not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    // If changing warehouse, validate the new warehouse
    if (locationData.warehouse_id) {
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('id')
        .eq('id', locationData.warehouse_id)
        .eq('status', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (warehouseError) {
        if (warehouseError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Warehouse not found or you do not have permission to add locations to it' });
        }
        throw warehouseError;
      }
    }
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .update(locationData)
      .eq('id', locationData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating warehouse location:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a warehouse location (soft delete)
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Check if location exists and belongs to the company
    const { data: existingLocation, error: checkError } = await supabase
      .from('warehouse_locations')
      .select('id')
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse location not found or you do not have permission to delete it' });
      }
      throw checkError;
    }
    
    // Check if there are any shelves in this location
    const { count: shelvesCount, error: shelvesError } = await supabase
      .from('warehouse_shelves')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', id)
      .eq('status', true);
      
    if (shelvesError) throw shelvesError;
    
    if (shelvesCount && shelvesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete location with existing shelves. Please delete the ${shelvesCount} shelves first.` 
      });
    }
    
    // Check if there is any inventory in this location
    const { count: inventoryCount, error: inventoryError } = await supabase
      .from('warehouse_inventory')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', id)
      .eq('is_active', true);
      
    if (inventoryError) throw inventoryError;
    
    if (inventoryCount && inventoryCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete location with existing inventory. Please move the ${inventoryCount} inventory items first.` 
      });
    }
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('warehouse_locations')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: 'Warehouse location deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting warehouse location:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get locations by warehouse ID
export const getLocationsByWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const companyId = req.user?.companyId;
    
    // Validate warehouse existence and company ID
    const { data: warehouseData, error: warehouseError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', warehouseId)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
    
    if (warehouseError) {
      if (warehouseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to view its locations' });
      }
      throw warehouseError;
    }
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse locations by warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get location with detailed information
export const getLocationWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_locations')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code, address),
        shelves:warehouse_shelves(id, name, code, description, shelf_row, shelf_column, capacity)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse location not found' });
      }
      throw error;
    }
    
    // Get inventory summary for this location
    const { data: inventorySummary, error: inventoryError } = await supabase
      .from('warehouse_inventory')
      .select(`
        id,
        quantity,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        shelf:shelf_id(id, name, code)
      `)
      .eq('location_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (inventoryError) throw inventoryError;
    
    // Add inventory summary to the response
    const response = {
      ...data,
      inventory: inventorySummary || []
    };
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching warehouse location details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get locations with filtered search
export const getFilteredLocations = async (req: Request, res: Response) => {
  try {
    const { searchTerm, warehouseId, isActive } = req.query;
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouse_locations')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching filtered warehouse locations:', error);
    return res.status(500).json({ message: error.message });
  }
};