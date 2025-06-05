import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all production orders
export const getAllProductionOrders = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('production_orders')
      .select(`
        *,
        plan:plan_id(id, name, code),
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        recipe:recipe_id(id, name, code)
      `)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching production orders:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get production order by ID
export const getProductionOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('production_orders')
      .select(`
        *,
        plan:plan_id(id, name, code),
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        recipe:recipe_id(id, name, code)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production order not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching production order:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new production order
export const createProductionOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Add user data
    orderData.created_by = req.user?.id;
    orderData.company_id = req.user?.companyId;
    orderData.is_active = true;
    
    // Validate start and end dates
    if (new Date(orderData.start_date) > new Date(orderData.end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }
    
    // Validate that either product_id or semi_product_id is provided (but not both)
    if ((!orderData.product_id && !orderData.semi_product_id) || 
        (orderData.product_id && orderData.semi_product_id)) {
      return res.status(400).json({ 
        message: 'Exactly one of product_id or semi_product_id must be provided' 
      });
    }
    
    // Check if production plan exists and is active
    if (orderData.plan_id) {
      const { data: planData, error: planError } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('id', orderData.plan_id)
        .eq('is_active', true)
        .eq(orderData.company_id ? 'company_id' : 'id', orderData.company_id || 'id')
        .single();
        
      if (planError) {
        if (planError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Production plan not found' });
        }
        throw planError;
      }
      
      if (planData.status === 'completed' || planData.status === 'cancelled') {
        return res.status(400).json({ 
          message: `Cannot add orders to a ${planData.status} production plan` 
        });
      }
      
      // Set initial status based on plan status
      if (!orderData.status) {
        orderData.status = planData.status === 'active' ? 'pending' : 'draft';
      }
    }
    
    // Validate recipe_id if provided
    if (orderData.recipe_id) {
      // If product_id is provided, check if recipe is for this product
      if (orderData.product_id) {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', orderData.recipe_id)
          .eq('product_id', orderData.product_id)
          .is('semi_product_id', null)
          .eq('status', true)
          .eq(orderData.company_id ? 'company_id' : 'id', orderData.company_id || 'id')
          .single();
          
        if (recipeError && recipeError.code === 'PGRST116') {
          return res.status(400).json({ message: 'Recipe does not match the selected product' });
        }
      }
      
      // If semi_product_id is provided, check if recipe is for this semi-product
      if (orderData.semi_product_id) {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', orderData.recipe_id)
          .eq('semi_product_id', orderData.semi_product_id)
          .is('product_id', null)
          .eq('status', true)
          .eq(orderData.company_id ? 'company_id' : 'id', orderData.company_id || 'id')
          .single();
          
        if (recipeError && recipeError.code === 'PGRST116') {
          return res.status(400).json({ message: 'Recipe does not match the selected semi-product' });
        }
      }
    }
    
    const { data, error } = await supabase
      .from('production_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    
    // If recipe_id is provided, create production order materials based on recipe details
    if (orderData.recipe_id) {
      const { data: recipeDetails, error: recipeDetailsError } = await supabase
        .from('recipe_details')
        .select('raw_material_id, semi_product_id, quantity, unit')
        .eq('recipe_id', orderData.recipe_id)
        .eq('status', true)
        .eq(orderData.company_id ? 'company_id' : 'id', orderData.company_id || 'id');
        
      if (!recipeDetailsError && recipeDetails) {
        // Create materials for each recipe detail
        const materialPromises = recipeDetails.map((detail: any) => {
          const materialData = {
            order_id: data.id,
            raw_material_id: detail.raw_material_id,
            semi_product_id: detail.semi_product_id,
            quantity: detail.quantity * orderData.quantity, // Scale by order quantity
            unit: detail.unit,
            status: 'required',
            company_id: orderData.company_id,
            created_by: orderData.created_by,
            is_active: true
          };
          
          return supabase
            .from('production_order_materials')
            .insert(materialData);
        });
        
        await Promise.all(materialPromises);
      }
    }

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating production order:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a production order
export const updateProductionOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const companyId = req.user?.companyId;
    
    // Add user data for update
    orderData.updated_by = req.user?.id;
    orderData.updated_at = new Date();
    
    // Validate start and end dates
    if (new Date(orderData.start_date) > new Date(orderData.end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }
    
    // Check if production order exists and belongs to the company
    const { data: existingOrder, error: checkError } = await supabase
      .from('production_orders')
      .select('id, status, product_id, semi_product_id, plan_id')
      .eq('id', orderData.id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production order not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    // Check if we can edit the order based on its status
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot edit a ${existingOrder.status} production order` 
      });
    }
    
    // Validate that product/semi-product cannot be changed if there are any outputs
    if ((orderData.product_id && orderData.product_id !== existingOrder.product_id) ||
        (orderData.semi_product_id && orderData.semi_product_id !== existingOrder.semi_product_id)) {
      
      const { count: outputsCount, error: outputsError } = await supabase
        .from('production_outputs')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', orderData.id)
        .eq('is_active', true);
        
      if (outputsError) throw outputsError;
      
      if (outputsCount && outputsCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot change product or semi-product of an order that has outputs recorded' 
        });
      }
    }
    
    // Check if plan exists and is active (if changing plan)
    if (orderData.plan_id && orderData.plan_id !== existingOrder.plan_id) {
      const { data: planData, error: planError } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('id', orderData.plan_id)
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (planError) {
        if (planError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Production plan not found' });
        }
        throw planError;
      }
      
      if (planData.status === 'completed' || planData.status === 'cancelled') {
        return res.status(400).json({ 
          message: `Cannot move order to a ${planData.status} production plan` 
        });
      }
    }
    
    const { data, error } = await supabase
      .from('production_orders')
      .update(orderData)
      .eq('id', orderData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating production order:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a production order (soft delete)
export const deleteProductionOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Check if production order exists and belongs to the company
    const { data: existingOrder, error: checkError } = await supabase
      .from('production_orders')
      .select('id, status')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production order not found or you do not have permission to delete it' });
      }
      throw checkError;
    }
    
    // Check if order status allows deletion
    if (existingOrder.status !== 'draft' && existingOrder.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot delete a ${existingOrder.status} production order. Only draft or pending orders can be deleted.` 
      });
    }
    
    // Check if there are any outputs for this order
    const { count: outputsCount, error: outputsError } = await supabase
      .from('production_outputs')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', id)
      .eq('is_active', true);
      
    if (outputsError) throw outputsError;
    
    if (outputsCount && outputsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete production order with recorded outputs. Please delete the ${outputsCount} outputs first or change order status to cancelled.` 
      });
    }
    
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('production_orders')
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
    
    // Also set associated records to inactive
    await Promise.all([
      // Soft delete materials
      supabase
        .from('production_order_materials')
        .update({ 
          is_active: false,
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('order_id', id)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id'),
        
      // Soft delete resources
      supabase
        .from('production_order_resources')
        .update({ 
          is_active: false,
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('order_id', id)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id'),
        
      // Soft delete stages
      supabase
        .from('production_order_stages')
        .update({ 
          is_active: false,
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('order_id', id)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
    ]);

    return res.status(200).json({ message: 'Production order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting production order:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get production order with detailed information
export const getProductionOrderWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Get the production order
    const { data: order, error: orderError } = await supabase
      .from('production_orders')
      .select(`
        *,
        plan:plan_id(id, name, code, status),
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        recipe:recipe_id(id, name, code)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production order not found' });
      }
      throw orderError;
    }
    
    // Get order stages
    const { data: stages, error: stagesError } = await supabase
      .from('production_order_stages')
      .select(`
        *,
        stage:stage_id(id, name, description, sequence, estimated_duration)
      `)
      .eq('order_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('sequence', { ascending: true });
      
    if (stagesError) throw stagesError;
    
    // Get order materials
    const { data: materials, error: materialsError } = await supabase
      .from('production_order_materials')
      .select(`
        *,
        raw_material:raw_material_id(id, name, code),
        semi_product:semi_product_id(id, name, code)
      `)
      .eq('order_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (materialsError) throw materialsError;
    
    // Get order resources
    const { data: resources, error: resourcesError } = await supabase
      .from('production_order_resources')
      .select(`
        *,
        resource:resource_id(id, name, type),
        stage:stage_id(id, name)
      `)
      .eq('order_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (resourcesError) throw resourcesError;
    
    // Get order outputs
    const { data: outputs, error: outputsError } = await supabase
      .from('production_outputs')
      .select(`
        *,
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        stage:stage_id(id, name)
      `)
      .eq('order_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (outputsError) throw outputsError;
    
    // Combine order with related data
    const result = {
      ...order,
      stages: stages || [],
      materials: materials || [],
      resources: resources || [],
      outputs: outputs || []
    };
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching production order details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered production orders
export const getFilteredProductionOrders = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      priority, 
      planId,
      productId,
      semiProductId,
      recipeId,
      startDateFrom, 
      startDateTo, 
      endDateFrom, 
      endDateTo, 
      searchTerm 
    } = req.query;
    
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('production_orders')
      .select(`
        *,
        plan:plan_id(id, name, code),
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        recipe:recipe_id(id, name, code)
      `)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (planId) {
      query = query.eq('plan_id', planId);
    }
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (semiProductId) {
      query = query.eq('semi_product_id', semiProductId);
    }
    
    if (recipeId) {
      query = query.eq('recipe_id', recipeId);
    }
    
    if (startDateFrom) {
      query = query.gte('start_date', startDateFrom as string);
    }
    
    if (startDateTo) {
      query = query.lte('start_date', startDateTo as string);
    }
    
    if (endDateFrom) {
      query = query.gte('end_date', endDateFrom as string);
    }
    
    if (endDateTo) {
      query = query.lte('end_date', endDateTo as string);
    }
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching filtered production orders:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update production order status
export const updateProductionOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;
    const companyId = req.user?.companyId;
    
    // Validate status
    const validStatuses = ['draft', 'pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Validate progress if provided
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
      }
    }
    
    // Check if production order exists and belongs to the company
    const { data: existingOrder, error: checkError } = await supabase
      .from('production_orders')
      .select('id, status, plan_id')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production order not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    // Check current status and validate status transition
    if (existingOrder.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of a completed production order' });
    }
    
    if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of a cancelled production order' });
    }
    
    // Check if plan is active if moving to in_progress
    if (status === 'in_progress' && existingOrder.plan_id) {
      const { data: planData, error: planError } = await supabase
        .from('production_plans')
        .select('status')
        .eq('id', existingOrder.plan_id)
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .single();
        
      if (!planError && planData && planData.status !== 'active') {
        return res.status(400).json({ 
          message: 'Cannot start production for an order in a non-active plan' 
        });
      }
    }
    
    // Set progress based on status if not provided
    let updatedProgress = progress;
    if (updatedProgress === undefined) {
      if (status === 'completed') {
        updatedProgress = 100;
      } else if (status === 'cancelled') {
        updatedProgress = existingOrder.progress || 0;
      } else if (status === 'in_progress' && existingOrder.status === 'pending') {
        updatedProgress = 0;
      }
    }
    
    // Update the status
    const updateData: any = { 
      status,
      updated_by: req.user?.id,
      updated_at: new Date()
    };
    
    if (updatedProgress !== undefined) {
      updateData.progress = updatedProgress;
    }
    
    const { data, error } = await supabase
      .from('production_orders')
      .update(updateData)
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;
    
    // Update stages based on order status change
    if (status === 'in_progress' && existingOrder.status !== 'in_progress') {
      // Set first pending stage to in_progress if order is started
      const { data: firstStage, error: stageError } = await supabase
        .from('production_order_stages')
        .select('id')
        .eq('order_id', id)
        .eq('status', 'pending')
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id')
        .order('sequence', { ascending: true })
        .limit(1)
        .single();
        
      if (!stageError && firstStage) {
        await supabase
          .from('production_order_stages')
          .update({ 
            status: 'in_progress',
            actual_start_date: new Date(),
            updated_by: req.user?.id,
            updated_at: new Date()
          })
          .eq('id', firstStage.id)
          .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      }
    } else if (status === 'completed') {
      // Complete all in-progress stages
      await supabase
        .from('production_order_stages')
        .update({ 
          status: 'completed',
          actual_end_date: new Date(),
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('order_id', id)
        .eq('status', 'in_progress')
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    } else if (status === 'cancelled') {
      // Cancel all pending and in-progress stages
      await supabase
        .from('production_order_stages')
        .update({ 
          status: 'skipped',
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('order_id', id)
        .in('status', ['pending', 'in_progress'])
        .eq('is_active', true)
        .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating production order status:', error);
    return res.status(500).json({ message: error.message });
  }
};