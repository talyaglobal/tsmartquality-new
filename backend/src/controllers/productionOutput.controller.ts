import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all production outputs
 * @route GET /api/v1/production-outputs
 * @access Private - Admin, Manager, QualityManager
 */
export const getAllProductionOutputs = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { 
      orderId, 
      productId, 
      qualityStatus,
      warehouseId,
      locationId,
      startDate,
      endDate,
      sort = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('production_outputs')
      .select(`
        *,
        production_order:production_order_id(*),
        product:product_id(*),
        warehouse:warehouse_id(*),
        location:location_id(*)
      `, { count: 'exact' })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    // Apply filters
    if (orderId) {
      query = query.eq('production_order_id', orderId);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (qualityStatus && qualityStatus !== 'all') {
      query = query.eq('quality_status', qualityStatus);
    }

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
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
      console.error('Error fetching production outputs:', error);
      return res.status(500).json({ message: 'Failed to fetch production outputs', error });
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
    console.error('Error in getAllProductionOutputs:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get production output by ID
 * @route GET /api/v1/production-outputs/:id
 * @access Private - Admin, Manager, QualityManager
 */
export const getProductionOutputById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const { data, error } = await supabase
      .from('production_outputs')
      .select(`
        *,
        production_order:production_order_id(
          id,
          name,
          product_id,
          production_plan_id,
          production_plan:production_plan_id(
            id,
            name
          )
        ),
        product:product_id(
          id,
          name,
          sku,
          description
        ),
        warehouse:warehouse_id(
          id,
          name,
          code
        ),
        location:location_id(
          id,
          name,
          code
        ),
        quality_checks:production_quality_checks(*)
      `)
      .eq('id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      console.error('Error fetching production output:', error);
      return res.status(404).json({ message: 'Production output not found', error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getProductionOutputById:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Create a new production output
 * @route POST /api/v1/production-outputs
 * @access Private - Admin, Manager
 */
export const createProductionOutput = async (req: Request, res: Response) => {
  try {
    const {
      production_order_id,
      product_id,
      quantity,
      unit_of_measure,
      lot_number,
      batch_number,
      quality_status = 'pending_inspection',
      warehouse_id,
      location_id,
      notes
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if order exists
    const { data: orderData, error: orderError } = await supabase
      .from('production_orders')
      .select('id, product_id, company_id, order_status')
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

    // Check if order is active or completed
    if (!['in_progress', 'completed'].includes(orderData.order_status)) {
      return res.status(400).json({
        message: `Cannot record output for an order with status '${orderData.order_status}'. Order must be in progress or completed.`
      });
    }

    // Check if the product matches the order's product
    if (product_id && orderData.product_id && product_id !== orderData.product_id) {
      return res.status(400).json({
        message: 'Product ID does not match the production order product'
      });
    }

    // If warehouse and location are provided, validate they exist and belong to the company
    if (warehouse_id && location_id) {
      const { data: locationData, error: locationError } = await supabase
        .from('warehouse_locations')
        .select('id, warehouse_id, company_id')
        .eq('id', location_id)
        .eq('warehouse_id', warehouse_id)
        .eq('status', true)
        .single();

      if (locationError || !locationData) {
        return res.status(404).json({ 
          message: 'Warehouse location not found or does not belong to the specified warehouse', 
          error: locationError 
        });
      }

      // If companyId is set, check if user has access to this location
      if (companyId && locationData.company_id !== companyId) {
        return res.status(403).json({ message: 'You do not have access to this warehouse location' });
      }
    } else if (warehouse_id) {
      // If only warehouse is provided, validate it exists
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('id, company_id')
        .eq('id', warehouse_id)
        .eq('status', true)
        .single();

      if (warehouseError || !warehouseData) {
        return res.status(404).json({ message: 'Warehouse not found', error: warehouseError });
      }

      // If companyId is set, check if user has access to this warehouse
      if (companyId && warehouseData.company_id !== companyId) {
        return res.status(403).json({ message: 'You do not have access to this warehouse' });
      }
    }

    // Validate quality status
    const validStatuses = ['pending_inspection', 'passed', 'failed', 'rework'];
    if (!validStatuses.includes(quality_status)) {
      return res.status(400).json({
        message: `Invalid quality status. Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Create the production output
    const { data, error } = await supabase
      .from('production_outputs')
      .insert({
        production_order_id,
        product_id: product_id || orderData.product_id,
        quantity,
        unit_of_measure,
        lot_number,
        batch_number,
        quality_status,
        warehouse_id,
        location_id,
        notes,
        status: true,
        company_id: companyId || orderData.company_id,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating production output:', error);
      return res.status(500).json({ message: 'Failed to create production output', error });
    }

    // If warehouse and location are provided, update inventory
    if (warehouse_id && location_id && quality_status === 'passed') {
      try {
        // Check if product exists in inventory at the location
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('warehouse_inventory')
          .select('id, quantity')
          .eq('product_id', product_id || orderData.product_id)
          .eq('warehouse_id', warehouse_id)
          .eq('location_id', location_id)
          .eq('status', true)
          .maybeSingle();

        if (inventoryError) {
          console.error('Error checking inventory:', inventoryError);
          // Don't fail the operation, just log the error
        } else {
          if (inventoryData) {
            // Update existing inventory
            await supabase
              .from('warehouse_inventory')
              .update({
                quantity: inventoryData.quantity + Number(quantity),
                updated_by: userId,
                updated_at: new Date()
              })
              .eq('id', inventoryData.id);
          } else {
            // Create new inventory entry
            await supabase
              .from('warehouse_inventory')
              .insert({
                product_id: product_id || orderData.product_id,
                warehouse_id,
                location_id,
                quantity,
                unit_of_measure,
                lot_number,
                batch_number,
                status: true,
                company_id: companyId || orderData.company_id,
                created_by: userId
              });
          }

          // Record inventory movement
          await supabase
            .from('warehouse_movements')
            .insert({
              warehouse_id,
              location_id,
              product_id: product_id || orderData.product_id,
              quantity,
              direction: 'in',
              source: 'production',
              reference_id: data.id,
              reference_type: 'production_output',
              notes: `Production output: Order #${production_order_id}`,
              status: true,
              company_id: companyId || orderData.company_id,
              created_by: userId
            });
        }
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Don't fail the operation, just log the error
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Production output created successfully',
      data
    });
  } catch (error) {
    console.error('Error in createProductionOutput:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update a production output
 * @route PUT /api/v1/production-outputs/:id
 * @access Private - Admin, Manager
 */
export const updateProductionOutput = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      unit_of_measure,
      lot_number,
      batch_number,
      quality_status,
      warehouse_id,
      location_id,
      notes
    } = req.body;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if output exists
    const { data: outputData, error: outputError } = await supabase
      .from('production_outputs')
      .select('id, production_order_id, product_id, quantity, warehouse_id, location_id, quality_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (outputError || !outputData) {
      return res.status(404).json({ message: 'Production output not found', error: outputError });
    }

    // If companyId is set, check if user has access to this output
    if (companyId && outputData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production output' });
    }

    // If quality status is changing, validate it
    if (quality_status && quality_status !== outputData.quality_status) {
      const validStatuses = ['pending_inspection', 'passed', 'failed', 'rework'];
      if (!validStatuses.includes(quality_status)) {
        return res.status(400).json({
          message: `Invalid quality status. Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }

    // If warehouse and location are changing, validate they exist and belong to the company
    if ((warehouse_id && warehouse_id !== outputData.warehouse_id) || 
        (location_id && location_id !== outputData.location_id)) {
      
      if (warehouse_id && location_id) {
        const { data: locationData, error: locationError } = await supabase
          .from('warehouse_locations')
          .select('id, warehouse_id, company_id')
          .eq('id', location_id)
          .eq('warehouse_id', warehouse_id)
          .eq('status', true)
          .single();

        if (locationError || !locationData) {
          return res.status(404).json({ 
            message: 'Warehouse location not found or does not belong to the specified warehouse', 
            error: locationError 
          });
        }

        // If companyId is set, check if user has access to this location
        if (companyId && locationData.company_id !== companyId) {
          return res.status(403).json({ message: 'You do not have access to this warehouse location' });
        }
      } else if (warehouse_id) {
        // If only warehouse is provided, validate it exists
        const { data: warehouseData, error: warehouseError } = await supabase
          .from('warehouses')
          .select('id, company_id')
          .eq('id', warehouse_id)
          .eq('status', true)
          .single();

        if (warehouseError || !warehouseData) {
          return res.status(404).json({ message: 'Warehouse not found', error: warehouseError });
        }

        // If companyId is set, check if user has access to this warehouse
        if (companyId && warehouseData.company_id !== companyId) {
          return res.status(403).json({ message: 'You do not have access to this warehouse' });
        }
      }
    }

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date()
    };

    // Only include fields that are provided
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit_of_measure !== undefined) updateData.unit_of_measure = unit_of_measure;
    if (lot_number !== undefined) updateData.lot_number = lot_number;
    if (batch_number !== undefined) updateData.batch_number = batch_number;
    if (quality_status !== undefined) updateData.quality_status = quality_status;
    if (warehouse_id !== undefined) updateData.warehouse_id = warehouse_id;
    if (location_id !== undefined) updateData.location_id = location_id;
    if (notes !== undefined) updateData.notes = notes;

    // Update the production output
    const { data, error } = await supabase
      .from('production_outputs')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) {
      console.error('Error updating production output:', error);
      return res.status(500).json({ message: 'Failed to update production output', error });
    }

    // Handle inventory updates if quantity or quality status changed
    if ((quantity !== undefined && quantity !== outputData.quantity) || 
        (quality_status !== undefined && quality_status !== outputData.quality_status)) {
      
      // If output was previously passed and in inventory
      if (outputData.quality_status === 'passed' && outputData.warehouse_id && outputData.location_id) {
        try {
          // Remove the old quantity from inventory
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('warehouse_inventory')
            .select('id, quantity')
            .eq('product_id', outputData.product_id)
            .eq('warehouse_id', outputData.warehouse_id)
            .eq('location_id', outputData.location_id)
            .eq('status', true)
            .maybeSingle();

          if (!inventoryError && inventoryData) {
            await supabase
              .from('warehouse_inventory')
              .update({
                quantity: Math.max(0, inventoryData.quantity - Number(outputData.quantity)),
                updated_by: userId,
                updated_at: new Date()
              })
              .eq('id', inventoryData.id);

            // Record inventory movement out
            await supabase
              .from('warehouse_movements')
              .insert({
                warehouse_id: outputData.warehouse_id,
                location_id: outputData.location_id,
                product_id: outputData.product_id,
                quantity: outputData.quantity,
                direction: 'out',
                source: 'production',
                reference_id: id,
                reference_type: 'production_output_update',
                notes: `Production output update: Output #${id}`,
                status: true,
                company_id: companyId,
                created_by: userId
              });
          }
        } catch (inventoryError) {
          console.error('Error updating inventory (removal):', inventoryError);
          // Don't fail the operation, just log the error
        }
      }

      // If output is now passed and should be in inventory
      if (quality_status === 'passed' && 
          (warehouse_id || outputData.warehouse_id) && 
          (location_id || outputData.location_id)) {
        
        const finalWarehouseId = warehouse_id || outputData.warehouse_id;
        const finalLocationId = location_id || outputData.location_id;
        const finalQuantity = quantity !== undefined ? quantity : outputData.quantity;

        try {
          // Check if product exists in inventory at the location
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('warehouse_inventory')
            .select('id, quantity')
            .eq('product_id', outputData.product_id)
            .eq('warehouse_id', finalWarehouseId)
            .eq('location_id', finalLocationId)
            .eq('status', true)
            .maybeSingle();

          if (!inventoryError) {
            if (inventoryData) {
              // Update existing inventory
              await supabase
                .from('warehouse_inventory')
                .update({
                  quantity: inventoryData.quantity + Number(finalQuantity),
                  updated_by: userId,
                  updated_at: new Date()
                })
                .eq('id', inventoryData.id);
            } else {
              // Create new inventory entry
              await supabase
                .from('warehouse_inventory')
                .insert({
                  product_id: outputData.product_id,
                  warehouse_id: finalWarehouseId,
                  location_id: finalLocationId,
                  quantity: finalQuantity,
                  unit_of_measure: unit_of_measure || outputData.unit_of_measure,
                  lot_number: lot_number || outputData.lot_number,
                  batch_number: batch_number || outputData.batch_number,
                  status: true,
                  company_id: companyId,
                  created_by: userId
                });
            }

            // Record inventory movement in
            await supabase
              .from('warehouse_movements')
              .insert({
                warehouse_id: finalWarehouseId,
                location_id: finalLocationId,
                product_id: outputData.product_id,
                quantity: finalQuantity,
                direction: 'in',
                source: 'production',
                reference_id: id,
                reference_type: 'production_output_update',
                notes: `Production output update: Output #${id}`,
                status: true,
                company_id: companyId,
                created_by: userId
              });
          }
        } catch (inventoryError) {
          console.error('Error updating inventory (addition):', inventoryError);
          // Don't fail the operation, just log the error
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Production output updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updateProductionOutput:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Delete a production output (soft delete)
 * @route DELETE /api/v1/production-outputs/:id
 * @access Private - Admin, Manager
 */
export const deleteProductionOutput = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if output exists
    const { data: outputData, error: outputError } = await supabase
      .from('production_outputs')
      .select('id, production_order_id, product_id, quantity, warehouse_id, location_id, quality_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (outputError || !outputData) {
      return res.status(404).json({ message: 'Production output not found', error: outputError });
    }

    // If companyId is set, check if user has access to this output
    if (companyId && outputData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production output' });
    }

    // If output was in inventory, remove it
    if (outputData.quality_status === 'passed' && outputData.warehouse_id && outputData.location_id) {
      try {
        // Check if product exists in inventory at the location
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('warehouse_inventory')
          .select('id, quantity')
          .eq('product_id', outputData.product_id)
          .eq('warehouse_id', outputData.warehouse_id)
          .eq('location_id', outputData.location_id)
          .eq('status', true)
          .maybeSingle();

        if (!inventoryError && inventoryData) {
          // Update inventory quantity
          await supabase
            .from('warehouse_inventory')
            .update({
              quantity: Math.max(0, inventoryData.quantity - Number(outputData.quantity)),
              updated_by: userId,
              updated_at: new Date()
            })
            .eq('id', inventoryData.id);

          // Record inventory movement
          await supabase
            .from('warehouse_movements')
            .insert({
              warehouse_id: outputData.warehouse_id,
              location_id: outputData.location_id,
              product_id: outputData.product_id,
              quantity: outputData.quantity,
              direction: 'out',
              source: 'production',
              reference_id: id,
              reference_type: 'production_output_delete',
              notes: `Production output deleted: Output #${id}`,
              status: true,
              company_id: companyId,
              created_by: userId
            });
        }
      } catch (inventoryError) {
        console.error('Error updating inventory during deletion:', inventoryError);
        // Don't fail the operation, just log the error
      }
    }

    // Soft delete the output
    const { error: deleteError } = await supabase
      .from('production_outputs')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error deleting production output:', deleteError);
      return res.status(500).json({ message: 'Failed to delete production output', error: deleteError });
    }

    return res.status(200).json({
      success: true,
      message: 'Production output deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProductionOutput:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Link a quality check to a production output
 * @route POST /api/v1/production-outputs/:id/quality-checks
 * @access Private - Admin, Manager, QualityManager
 */
export const linkQualityCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quality_check_id } = req.body;
    
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!quality_check_id) {
      return res.status(400).json({ message: 'Quality check ID is required' });
    }

    // Check if output exists
    const { data: outputData, error: outputError } = await supabase
      .from('production_outputs')
      .select('id, production_order_id, quality_status, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (outputError || !outputData) {
      return res.status(404).json({ message: 'Production output not found', error: outputError });
    }

    // If companyId is set, check if user has access to this output
    if (companyId && outputData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production output' });
    }

    // Check if quality check exists
    const { data: checkData, error: checkError } = await supabase
      .from('production_quality_checks')
      .select('id, production_stage_id, passed, company_id')
      .eq('id', quality_check_id)
      .eq('status', true)
      .single();

    if (checkError || !checkData) {
      return res.status(404).json({ message: 'Quality check not found', error: checkError });
    }

    // If companyId is set, check if user has access to this check
    if (companyId && checkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this quality check' });
    }

    // Check if the quality check belongs to a stage in the same production order
    const { data: stageData, error: stageError } = await supabase
      .from('production_stages')
      .select('id, production_order_id')
      .eq('id', checkData.production_stage_id)
      .eq('status', true)
      .single();

    if (stageError || !stageData) {
      return res.status(404).json({ message: 'Production stage not found', error: stageError });
    }

    if (stageData.production_order_id !== outputData.production_order_id) {
      return res.status(400).json({
        message: 'Quality check must belong to the same production order as the output'
      });
    }

    // Check if this quality check is already linked to this output
    const { data: existingLink, error: linkError } = await supabase
      .from('output_quality_checks')
      .select('id')
      .eq('production_output_id', id)
      .eq('quality_check_id', quality_check_id)
      .eq('status', true)
      .maybeSingle();

    if (linkError) {
      console.error('Error checking existing link:', linkError);
      return res.status(500).json({ message: 'Failed to check existing link', error: linkError });
    }

    if (existingLink) {
      return res.status(400).json({ message: 'Quality check is already linked to this output' });
    }

    // Create the link
    const { data, error } = await supabase
      .from('output_quality_checks')
      .insert({
        production_output_id: id,
        quality_check_id,
        status: true,
        company_id: companyId,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error linking quality check to output:', error);
      return res.status(500).json({ message: 'Failed to link quality check to output', error });
    }

    // Update the output quality status based on the check result
    const newQualityStatus = checkData.passed ? 'passed' : 'failed';
    
    await supabase
      .from('production_outputs')
      .update({
        quality_status: newQualityStatus,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id);

    return res.status(201).json({
      success: true,
      message: 'Quality check linked to output successfully',
      data
    });
  } catch (error) {
    console.error('Error in linkQualityCheck:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Unlink a quality check from a production output
 * @route DELETE /api/v1/production-outputs/:id/quality-checks/:checkId
 * @access Private - Admin, Manager
 */
export const unlinkQualityCheck = async (req: Request, res: Response) => {
  try {
    const { id, checkId } = req.params;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    // Check if the link exists
    const { data: linkData, error: linkError } = await supabase
      .from('output_quality_checks')
      .select('id, company_id')
      .eq('production_output_id', id)
      .eq('quality_check_id', checkId)
      .eq('status', true)
      .single();

    if (linkError || !linkData) {
      return res.status(404).json({ message: 'Link between output and quality check not found', error: linkError });
    }

    // If companyId is set, check if user has access to this link
    if (companyId && linkData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this link' });
    }

    // Soft delete the link
    const { error: deleteError } = await supabase
      .from('output_quality_checks')
      .update({
        status: false,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', linkData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (deleteError) {
      console.error('Error unlinking quality check from output:', deleteError);
      return res.status(500).json({ message: 'Failed to unlink quality check from output', error: deleteError });
    }

    // Reset the output quality status to pending_inspection
    await supabase
      .from('production_outputs')
      .update({
        quality_status: 'pending_inspection',
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id);

    return res.status(200).json({
      success: true,
      message: 'Quality check unlinked from output successfully'
    });
  } catch (error) {
    console.error('Error in unlinkQualityCheck:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get quality checks for a production output
 * @route GET /api/v1/production-outputs/:id/quality-checks
 * @access Private - Admin, Manager, QualityManager
 */
export const getOutputQualityChecks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    // Check if output exists
    const { data: outputData, error: outputError } = await supabase
      .from('production_outputs')
      .select('id, company_id')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (outputError || !outputData) {
      return res.status(404).json({ message: 'Production output not found', error: outputError });
    }

    // If companyId is set, check if user has access to this output
    if (companyId && outputData.company_id !== companyId) {
      return res.status(403).json({ message: 'You do not have access to this production output' });
    }

    // Get the linked quality checks
    const { data, error } = await supabase
      .from('output_quality_checks')
      .select(`
        id,
        quality_check:quality_check_id(
          id,
          production_stage_id,
          checked_by,
          check_date,
          passed,
          notes,
          production_stage:production_stage_id(
            id,
            name
          ),
          checked_by_user:checked_by(
            id,
            email,
            first_name,
            last_name
          ),
          quality_check_items(*)
        )
      `)
      .eq('production_output_id', id)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');

    if (error) {
      console.error('Error fetching output quality checks:', error);
      return res.status(500).json({ message: 'Failed to fetch output quality checks', error });
    }

    return res.status(200).json({
      success: true,
      data: data.map(item => item.quality_check)
    });
  } catch (error) {
    console.error('Error in getOutputQualityChecks:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};