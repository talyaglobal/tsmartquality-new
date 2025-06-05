import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all warehouses
export const getAllWarehouses = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse by ID
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new warehouse
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const warehouseData = req.body;
    
    // Add user data
    warehouseData.created_by = req.user?.id;
    warehouseData.company_id = req.user?.companyId;
    warehouseData.status = true;
    
    const { data, error } = await supabase
      .from('warehouses')
      .insert(warehouseData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a warehouse
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const warehouseData = req.body;
    const companyId = req.user?.companyId;
    
    // Add user data for update
    warehouseData.updated_by = req.user?.id;
    warehouseData.updated_at = new Date();
    
    // Check if warehouse exists and belongs to the company
    const { data: existingWarehouse, error: checkError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', warehouseData.id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    const { data, error } = await supabase
      .from('warehouses')
      .update(warehouseData)
      .eq('id', warehouseData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a warehouse (soft delete)
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Check if warehouse exists and belongs to the company
    const { data: existingWarehouse, error: checkError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to delete it' });
      }
      throw checkError;
    }
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('warehouses')
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

    return res.status(200).json({ message: 'Warehouse deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouse with detailed information
export const getWarehouseWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        country:country_id(id, name, code)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found' });
      }
      throw error;
    }
    
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouse details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all warehouses with their country details
export const getAllWarehousesWithDetails = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        country:country_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouses with details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouses with filtered search
export const getFilteredWarehouses = async (req: Request, res: Response) => {
  try {
    const { searchTerm, countryId } = req.query;
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouses')
      .select(`
        *,
        country:country_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    }
    
    if (countryId) {
      query = query.eq('country_id', countryId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching filtered warehouses:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get warehouses by country
export const getWarehousesByCountry = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        country:country_id(id, name, code)
      `)
      .eq('status', true)
      .eq('country_id', countryId)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching warehouses by country:', error);
    return res.status(500).json({ message: error.message });
  }
};