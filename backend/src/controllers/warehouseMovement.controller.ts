import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all movement history
export const getAllMovements = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_movements')
      .select(`
        *,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name, code),
        to_warehouse:to_warehouse_id(id, name, code),
        from_location:from_location_id(id, name, code),
        to_location:to_location_id(id, name, code),
        from_shelf:from_shelf_id(id, name, code),
        to_shelf:to_shelf_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching movement history:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get movement by ID
export const getMovementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_movements')
      .select(`
        *,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name, code),
        to_warehouse:to_warehouse_id(id, name, code),
        from_location:from_location_id(id, name, code),
        to_location:to_location_id(id, name, code),
        from_shelf:from_shelf_id(id, name, code),
        to_shelf:to_shelf_id(id, name, code)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Movement record not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching movement record:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new movement record
export const createMovement = async (req: Request, res: Response) => {
  try {
    const movementData = req.body;
    
    // Add user data
    movementData.created_by = req.user?.id;
    movementData.company_id = req.user?.companyId;
    movementData.status = true;
    
    // Validate that we have either product_id, raw_material_id, or semi_product_id
    const itemTypeCount = [
      movementData.product_id ? 1 : 0,
      movementData.raw_material_id ? 1 : 0,
      movementData.semi_product_id ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    if (itemTypeCount !== 1) {
      return res.status(400).json({ 
        message: 'Exactly one of product_id, raw_material_id, or semi_product_id must be provided' 
      });
    }
    
    // Validate movement type
    const validMovementTypes = ['in', 'out', 'transfer', 'adjustment'];
    if (!validMovementTypes.includes(movementData.movement_type)) {
      return res.status(400).json({ 
        message: `Movement type must be one of: ${validMovementTypes.join(', ')}` 
      });
    }
    
    // Validate source and destination based on movement type
    if (movementData.movement_type === 'in' && !movementData.to_warehouse_id) {
      return res.status(400).json({ message: 'Destination warehouse is required for incoming movements' });
    }
    
    if (movementData.movement_type === 'out' && !movementData.from_warehouse_id) {
      return res.status(400).json({ message: 'Source warehouse is required for outgoing movements' });
    }
    
    if (movementData.movement_type === 'transfer') {
      if (!movementData.from_warehouse_id || !movementData.to_warehouse_id) {
        return res.status(400).json({ message: 'Both source and destination warehouses are required for transfers' });
      }
    }
    
    // Create the movement record
    const { data, error } = await supabase
      .from('warehouse_movements')
      .insert(movementData)
      .select()
      .single();

    if (error) throw error;
    
    // Update inventory based on the movement type
    await handleInventoryUpdate(movementData, req.user?.companyId);

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating movement record:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Handle inventory updates based on movement type
const handleInventoryUpdate = async (movementData: any, companyId: number | undefined) => {
  const { 
    movement_type, 
    product_id, 
    raw_material_id, 
    semi_product_id,
    from_warehouse_id,
    to_warehouse_id,
    from_location_id,
    to_location_id,
    from_shelf_id,
    to_shelf_id,
    quantity,
    unit,
    lot_number,
    batch_number
  } = movementData;
  
  try {
    // For incoming stock
    if (movement_type === 'in') {
      // Check if there's an existing inventory item that matches the criteria
      const { data: existingItem, error: findError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', to_warehouse_id)
        .eq('location_id', to_location_id || null)
        .eq('shelf_id', to_shelf_id || null)
        .eq('product_id', product_id || null)
        .eq('raw_material_id', raw_material_id || null)
        .eq('semi_product_id', semi_product_id || null)
        .eq('lot_number', lot_number || '')
        .eq('batch_number', batch_number || '')
        .eq('is_active', true)
        .eq('status', 'available')
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .maybeSingle();
        
      if (findError) throw findError;
      
      if (existingItem) {
        // Update existing inventory item
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: Number(existingItem.quantity) + Number(quantity),
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', existingItem.id);
      } else {
        // Create new inventory item
        await supabase
          .from('warehouse_inventory')
          .insert({
            warehouse_id: to_warehouse_id,
            location_id: to_location_id,
            shelf_id: to_shelf_id,
            product_id,
            raw_material_id,
            semi_product_id,
            quantity,
            unit,
            lot_number,
            batch_number,
            status: 'available',
            company_id: companyId,
            is_active: true,
            created_by: movementData.created_by
          });
      }
    }
    
    // For outgoing stock
    if (movement_type === 'out') {
      // Find matching inventory item
      const { data: existingItem, error: findError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', from_warehouse_id)
        .eq('location_id', from_location_id || null)
        .eq('shelf_id', from_shelf_id || null)
        .eq('product_id', product_id || null)
        .eq('raw_material_id', raw_material_id || null)
        .eq('semi_product_id', semi_product_id || null)
        .eq('lot_number', lot_number || '')
        .eq('batch_number', batch_number || '')
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .maybeSingle();
        
      if (findError) throw findError;
      
      if (!existingItem) {
        throw new Error('No matching inventory item found for this outgoing movement');
      }
      
      // Check if we have enough quantity
      if (Number(existingItem.quantity) < Number(quantity)) {
        throw new Error(`Insufficient inventory. Available: ${existingItem.quantity}, Requested: ${quantity}`);
      }
      
      const newQuantity = Number(existingItem.quantity) - Number(quantity);
      
      if (newQuantity > 0) {
        // Update existing inventory item
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: newQuantity,
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', existingItem.id);
      } else {
        // Remove inventory item (soft delete)
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: 0,
            is_active: false,
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', existingItem.id);
      }
    }
    
    // For transfers
    if (movement_type === 'transfer') {
      // Handle outgoing part
      const { data: sourceItem, error: sourceError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', from_warehouse_id)
        .eq('location_id', from_location_id || null)
        .eq('shelf_id', from_shelf_id || null)
        .eq('product_id', product_id || null)
        .eq('raw_material_id', raw_material_id || null)
        .eq('semi_product_id', semi_product_id || null)
        .eq('lot_number', lot_number || '')
        .eq('batch_number', batch_number || '')
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .maybeSingle();
        
      if (sourceError) throw sourceError;
      
      if (!sourceItem) {
        throw new Error('No matching source inventory item found for this transfer');
      }
      
      // Check if we have enough quantity
      if (Number(sourceItem.quantity) < Number(quantity)) {
        throw new Error(`Insufficient inventory for transfer. Available: ${sourceItem.quantity}, Requested: ${quantity}`);
      }
      
      // Handle incoming part (check if destination already has this item)
      const { data: destItem, error: destError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', to_warehouse_id)
        .eq('location_id', to_location_id || null)
        .eq('shelf_id', to_shelf_id || null)
        .eq('product_id', product_id || null)
        .eq('raw_material_id', raw_material_id || null)
        .eq('semi_product_id', semi_product_id || null)
        .eq('lot_number', lot_number || '')
        .eq('batch_number', batch_number || '')
        .eq('is_active', true)
        .eq('status', 'available')
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .maybeSingle();
        
      if (destError) throw destError;
      
      // Update source (outgoing)
      const newSourceQuantity = Number(sourceItem.quantity) - Number(quantity);
      if (newSourceQuantity > 0) {
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: newSourceQuantity,
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', sourceItem.id);
      } else {
        // Remove source inventory item if depleted
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: 0,
            is_active: false,
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', sourceItem.id);
      }
      
      // Update destination (incoming)
      if (destItem) {
        // Update existing item
        await supabase
          .from('warehouse_inventory')
          .update({
            quantity: Number(destItem.quantity) + Number(quantity),
            updated_by: movementData.created_by,
            updated_at: new Date()
          })
          .eq('id', destItem.id);
      } else {
        // Create new item
        await supabase
          .from('warehouse_inventory')
          .insert({
            warehouse_id: to_warehouse_id,
            location_id: to_location_id,
            shelf_id: to_shelf_id,
            product_id,
            raw_material_id,
            semi_product_id,
            quantity,
            unit: sourceItem.unit,
            lot_number: sourceItem.lot_number,
            batch_number: sourceItem.batch_number,
            expiry_date: sourceItem.expiry_date,
            production_date: sourceItem.production_date,
            status: 'available',
            company_id: companyId,
            is_active: true,
            created_by: movementData.created_by
          });
      }
    }
    
    // For adjustments
    if (movement_type === 'adjustment') {
      // Find the inventory item to adjust
      const { data: existingItem, error: findError } = await supabase
        .from('warehouse_inventory')
        .select('*')
        .eq('warehouse_id', from_warehouse_id || to_warehouse_id)
        .eq('location_id', from_location_id || to_location_id || null)
        .eq('shelf_id', from_shelf_id || to_shelf_id || null)
        .eq('product_id', product_id || null)
        .eq('raw_material_id', raw_material_id || null)
        .eq('semi_product_id', semi_product_id || null)
        .eq('lot_number', lot_number || '')
        .eq('batch_number', batch_number || '')
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .maybeSingle();
        
      if (findError) throw findError;
      
      if (!existingItem) {
        throw new Error('No matching inventory item found for this adjustment');
      }
      
      // Update the inventory quantity directly
      await supabase
        .from('warehouse_inventory')
        .update({
          quantity,
          updated_by: movementData.created_by,
          updated_at: new Date()
        })
        .eq('id', existingItem.id);
    }
  } catch (error) {
    console.error('Error handling inventory update:', error);
    throw error;
  }
};

// Get movements by warehouse
export const getMovementsByWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('warehouse_movements')
      .select(`
        *,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name, code),
        to_warehouse:to_warehouse_id(id, name, code)
      `)
      .or(`from_warehouse_id.eq.${warehouseId},to_warehouse_id.eq.${warehouseId}`)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching movements by warehouse:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get movements by product, raw material, or semi-product
export const getMovementsByItem = async (req: Request, res: Response) => {
  try {
    const { itemType, itemId } = req.params;
    const companyId = req.user?.companyId;
    
    if (!['product', 'raw-material', 'semi-product'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type. Must be one of: product, raw-material, semi-product' });
    }
    
    let query = supabase
      .from('warehouse_movements')
      .select(`
        *,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name, code),
        to_warehouse:to_warehouse_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    // Apply filter based on item type
    if (itemType === 'product') {
      query = query.eq('product_id', itemId);
    } else if (itemType === 'raw-material') {
      query = query.eq('raw_material_id', itemId);
    } else if (itemType === 'semi-product') {
      query = query.eq('semi_product_id', itemId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching movements by item:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get movement history summary with filtering
export const getFilteredMovements = async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      movementType, 
      warehouseId, 
      productId, 
      rawMaterialId, 
      semiProductId,
      lotNumber,
      batchNumber
    } = req.query;
    
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('warehouse_movements')
      .select(`
        *,
        product:product_id(id, name, code),
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        from_warehouse:from_warehouse_id(id, name, code),
        to_warehouse:to_warehouse_id(id, name, code)
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (startDate && endDate) {
      query = query.gte('created_at', startDate as string).lte('created_at', endDate as string);
    } else if (startDate) {
      query = query.gte('created_at', startDate as string);
    } else if (endDate) {
      query = query.lte('created_at', endDate as string);
    }
    
    if (movementType) {
      query = query.eq('movement_type', movementType);
    }
    
    if (warehouseId) {
      query = query.or(`from_warehouse_id.eq.${warehouseId},to_warehouse_id.eq.${warehouseId}`);
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
    
    if (lotNumber) {
      query = query.eq('lot_number', lotNumber);
    }
    
    if (batchNumber) {
      query = query.eq('batch_number', batchNumber);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching filtered movements:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get movement report (aggregated summary)
export const getMovementReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user?.companyId;
    
    // Base query conditions
    let dateCondition = '';
    if (startDate && endDate) {
      dateCondition = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else if (startDate) {
      dateCondition = `created_at >= '${startDate}'`;
    } else if (endDate) {
      dateCondition = `created_at <= '${endDate}'`;
    }
    
    const companyCondition = companyId ? `company_id = ${companyId}` : '';
    const whereClause = [dateCondition, companyCondition].filter(Boolean).join(' AND ');
    
    // Get movement summary by type
    const { data: movementSummary, error: summaryError } = await supabase.rpc(
      'get_movement_summary_by_type',
      { 
        where_clause: whereClause || 'true'
      }
    );
    
    if (summaryError) throw summaryError;
    
    // Get warehouse movement activity
    const { data: warehouseActivity, error: warehouseError } = await supabase.rpc(
      'get_movement_by_warehouse',
      { 
        where_clause: whereClause || 'true'
      }
    );
    
    if (warehouseError) throw warehouseError;
    
    // Get product movement activity (top 10)
    const { data: productActivity, error: productError } = await supabase.rpc(
      'get_movement_by_product',
      { 
        where_clause: whereClause || 'true',
        limit_count: 10
      }
    );
    
    if (productError) throw productError;
    
    // Format the response
    const report = {
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      },
      summary: movementSummary || [],
      warehouseActivity: warehouseActivity || [],
      topProducts: productActivity || []
    };
    
    return res.status(200).json(report);
  } catch (error: any) {
    console.error('Error generating movement report:', error);
    return res.status(500).json({ message: error.message });
  }
};