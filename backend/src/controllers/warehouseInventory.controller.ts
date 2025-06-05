import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all inventory items
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching inventory items:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get inventory item by ID
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching inventory item:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new inventory item
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryData = req.body;
    
    // Add user data
    inventoryData.created_by = req.user?.id;
    inventoryData.company_id = req.user?.companyId;
    inventoryData.is_active = true;
    
    // Validate warehouse, location, and shelf if provided
    if (inventoryData.warehouse_id) {
      const { error: warehouseError } = await supabase
        .from('warehouses')
        .select('id')
        .eq('id', inventoryData.warehouse_id)
        .eq('status', true)
        .eq(inventoryData.company_id ? 'company_id' : 'id', inventoryData.company_id || 'id')
        .single();
        
      if (warehouseError && warehouseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to add inventory to it' });
      }
    }
    
    if (inventoryData.location_id) {
      const { error: locationError } = await supabase
        .from('warehouse_locations')
        .select('id')
        .eq('id', inventoryData.location_id)
        .eq('status', true)
        .eq(inventoryData.company_id ? 'company_id' : 'id', inventoryData.company_id || 'id')
        .single();
        
      if (locationError && locationError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Location not found or you do not have permission to add inventory to it' });
      }
    }
    
    if (inventoryData.shelf_id) {
      const { error: shelfError } = await supabase
        .from('warehouse_shelves')
        .select('id')
        .eq('id', inventoryData.shelf_id)
        .eq('status', true)
        .eq(inventoryData.company_id ? 'company_id' : 'id', inventoryData.company_id || 'id')
        .single();
        
      if (shelfError && shelfError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Shelf not found or you do not have permission to add inventory to it' });
      }
    }
    
    // Validate that only one of product_id, raw_material_id, or semi_product_id is provided
    const itemTypeCount = [
      inventoryData.product_id ? 1 : 0,
      inventoryData.raw_material_id ? 1 : 0,
      inventoryData.semi_product_id ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    if (itemTypeCount !== 1) {
      return res.status(400).json({ 
        message: 'Exactly one of product_id, raw_material_id, or semi_product_id must be provided' 
      });
    }
    
    // Insert the inventory item
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .insert(inventoryData)
      .select()
      .single();

    if (error) throw error;

    // Create a movement record for this item (in)
    const movementData = {
      product_id: inventoryData.product_id,
      raw_material_id: inventoryData.raw_material_id,
      semi_product_id: inventoryData.semi_product_id,
      to_warehouse_id: inventoryData.warehouse_id,
      to_location_id: inventoryData.location_id,
      to_shelf_id: inventoryData.shelf_id,
      quantity: inventoryData.quantity,
      unit: inventoryData.unit,
      movement_type: 'in',
      lot_number: inventoryData.lot_number,
      batch_number: inventoryData.batch_number,
      notes: 'Initial inventory addition',
      company_id: inventoryData.company_id,
      created_by: inventoryData.created_by
    };
    
    await supabase
      .from('warehouse_movements')
      .insert(movementData);

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update an inventory item
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryData = req.body;
    const companyId = req.user?.companyId;
    const originalQuantity = inventoryData.original_quantity;
    delete inventoryData.original_quantity; // Remove this field before update
    
    // Add user data for update
    inventoryData.updated_by = req.user?.id;
    inventoryData.updated_at = new Date();
    
    // Check if inventory item exists and belongs to the company
    const { data: existingItem, error: checkError } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('id', inventoryData.id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Inventory item not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    // Validate warehouse, location, and shelf if provided
    if (inventoryData.warehouse_id && inventoryData.warehouse_id !== existingItem.warehouse_id) {
      const { error: warehouseError } = await supabase
        .from('warehouses')
        .select('id')
        .eq('id', inventoryData.warehouse_id)
        .eq('status', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (warehouseError && warehouseError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Warehouse not found or you do not have permission to move inventory to it' });
      }
    }
    
    if (inventoryData.location_id && inventoryData.location_id !== existingItem.location_id) {
      const { error: locationError } = await supabase
        .from('warehouse_locations')
        .select('id')
        .eq('id', inventoryData.location_id)
        .eq('status', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (locationError && locationError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Location not found or you do not have permission to move inventory to it' });
      }
    }
    
    if (inventoryData.shelf_id && inventoryData.shelf_id !== existingItem.shelf_id) {
      const { error: shelfError } = await supabase
        .from('warehouse_shelves')
        .select('id')
        .eq('id', inventoryData.shelf_id)
        .eq('status', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (shelfError && shelfError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Shelf not found or you do not have permission to move inventory to it' });
      }
    }
    
    // Update the inventory item
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .update(inventoryData)
      .eq('id', inventoryData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    // Create a movement record for quantity changes or location changes
    if (originalQuantity !== undefined && Number(inventoryData.quantity) !== Number(originalQuantity)) {
      const movementType = Number(inventoryData.quantity) > Number(originalQuantity) ? 'in' : 'out';
      const quantityChange = Math.abs(Number(inventoryData.quantity) - Number(originalQuantity));
      
      const movementData = {
        product_id: existingItem.product_id,
        raw_material_id: existingItem.raw_material_id,
        semi_product_id: existingItem.semi_product_id,
        from_warehouse_id: movementType === 'out' ? existingItem.warehouse_id : null,
        to_warehouse_id: movementType === 'in' ? existingItem.warehouse_id : null,
        from_location_id: movementType === 'out' ? existingItem.location_id : null,
        to_location_id: movementType === 'in' ? existingItem.location_id : null,
        from_shelf_id: movementType === 'out' ? existingItem.shelf_id : null,
        to_shelf_id: movementType === 'in' ? existingItem.shelf_id : null,
        quantity: quantityChange,
        unit: existingItem.unit,
        movement_type: movementType,
        lot_number: existingItem.lot_number,
        batch_number: existingItem.batch_number,
        notes: `Quantity adjustment from ${originalQuantity} to ${inventoryData.quantity}`,
        company_id: companyId,
        created_by: req.user?.id
      };
      
      await supabase
        .from('warehouse_movements')
        .insert(movementData);
    }
    
    // Create a movement record for location changes
    const isLocationChanged = 
      inventoryData.warehouse_id !== existingItem.warehouse_id ||
      inventoryData.location_id !== existingItem.location_id ||
      inventoryData.shelf_id !== existingItem.shelf_id;
      
    if (isLocationChanged) {
      const movementData = {
        product_id: existingItem.product_id,
        raw_material_id: existingItem.raw_material_id,
        semi_product_id: existingItem.semi_product_id,
        from_warehouse_id: existingItem.warehouse_id,
        to_warehouse_id: inventoryData.warehouse_id,
        from_location_id: existingItem.location_id,
        to_location_id: inventoryData.location_id,
        from_shelf_id: existingItem.shelf_id,
        to_shelf_id: inventoryData.shelf_id,
        quantity: inventoryData.quantity,
        unit: existingItem.unit,
        movement_type: 'transfer',
        lot_number: existingItem.lot_number,
        batch_number: existingItem.batch_number,
        notes: 'Inventory location transfer',
        company_id: companyId,
        created_by: req.user?.id
      };
      
      await supabase
        .from('warehouse_movements')
        .insert(movementData);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete an inventory item (soft delete)
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Check if inventory item exists and belongs to the company
    const { data: existingItem, error: checkError } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Inventory item not found or you do not have permission to delete it' });
      }
      throw checkError;
    }
    
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .update({ 
        is_active: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;
    
    // Create a movement record for this removal (out)
    const movementData = {
      product_id: existingItem.product_id,
      raw_material_id: existingItem.raw_material_id,
      semi_product_id: existingItem.semi_product_id,
      from_warehouse_id: existingItem.warehouse_id,
      from_location_id: existingItem.location_id,
      from_shelf_id: existingItem.shelf_id,
      quantity: existingItem.quantity,
      unit: existingItem.unit,
      movement_type: 'out',
      lot_number: existingItem.lot_number,
      batch_number: existingItem.batch_number,
      notes: 'Inventory item removed',
      company_id: companyId,
      created_by: req.user?.id
    };
    
    await supabase
      .from('warehouse_movements')
      .insert(movementData);

    return res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get inventory by warehouse
export const getInventoryByWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('warehouse_id', warehouseId)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching inventory by warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get inventory by location
export const getInventoryByLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('location_id', locationId)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching inventory by location:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get inventory by product
export const getInventoryByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code)
      `)
      .eq('product_id', productId)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching inventory by product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered inventory
export const getFilteredInventory = async (req: Request, res: Response) => {
  try {
    const { searchTerm, warehouseId, locationId, productId, rawMaterialId, semiProductId, status, lotNumber, batchNumber } = req.query;
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouse_inventory')
      .select(`
        *,
        warehouse:warehouse_id(id, name, code),
        location:location_id(id, name, code),
        shelf:shelf_id(id, name, code),
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (rawMaterialId) {
      query = query.eq('raw_material_id', rawMaterialId);
    }
    
    if (semiProductId) {
      query = query.eq('semi_product_id', semiProductId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (lotNumber) {
      query = query.eq('lot_number', lotNumber);
    }
    
    if (batchNumber) {
      query = query.eq('batch_number', batchNumber);
    }
    
    if (searchTerm) {
      // Search will be applied to lot and batch numbers directly
      query = query.or(`lot_number.ilike.%${searchTerm}%,batch_number.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching filtered inventory:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get inventory summary (aggregated data)
export const getInventorySummary = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    // Get total inventory count
    const { count: totalCount, error: countError } = await supabase
      .from('warehouse_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (countError) throw countError;
    
    // Get warehouse breakdown
    const { data: warehouseBreakdown, error: warehouseError } = await supabase.rpc(
      'get_inventory_by_warehouse',
      { company_id_param: companyId }
    );
    
    if (warehouseError) throw warehouseError;
    
    // Get product type breakdown
    const { data: productTypeBreakdown, error: productTypeError } = await supabase.rpc(
      'get_inventory_by_type',
      { company_id_param: companyId }
    );
    
    if (productTypeError) throw productTypeError;
    
    // Get recent movements
    const { data: recentMovements, error: movementsError } = await supabase
      .from('warehouse_movements')
      .select(`
        id,
        movement_type,
        quantity,
        unit,
        created_at,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name),
        to_warehouse:to_warehouse_id(id, name)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (movementsError) throw movementsError;
    
    // Format the response
    const summary = {
      totalItems: totalCount,
      warehouseBreakdown: warehouseBreakdown || [],
      typeBreakdown: productTypeBreakdown || [],
      recentMovements: recentMovements || []
    };
    
    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('Error fetching inventory summary:', error);
    return res.status(500).json({ message: error.message });
  }
};