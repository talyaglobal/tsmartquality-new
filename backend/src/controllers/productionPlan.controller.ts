import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all production plans
export const getAllProductionPlans = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('production_plans')
      .select('*')
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching production plans:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get production plan by ID
export const getProductionPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    const { data, error } = await supabase
      .from('production_plans')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production plan not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching production plan:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new production plan
export const createProductionPlan = async (req: Request, res: Response) => {
  try {
    const planData = req.body;
    
    // Add user data
    planData.created_by = req.user?.id;
    planData.company_id = req.user?.companyId;
    planData.is_active = true;
    
    // Validate start and end dates
    if (new Date(planData.start_date) > new Date(planData.end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }
    
    const { data, error } = await supabase
      .from('production_plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating production plan:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a production plan
export const updateProductionPlan = async (req: Request, res: Response) => {
  try {
    const planData = req.body;
    const companyId = req.user?.companyId;
    
    // Add user data for update
    planData.updated_by = req.user?.id;
    planData.updated_at = new Date();
    
    // Validate start and end dates
    if (new Date(planData.start_date) > new Date(planData.end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }
    
    // Check if production plan exists and belongs to the company
    const { data: existingPlan, error: checkError } = await supabase
      .from('production_plans')
      .select('id')
      .eq('id', planData.id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production plan not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    const { data, error } = await supabase
      .from('production_plans')
      .update(planData)
      .eq('id', planData.id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating production plan:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a production plan (soft delete)
export const deleteProductionPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Check if production plan exists and belongs to the company
    const { data: existingPlan, error: checkError } = await supabase
      .from('production_plans')
      .select('id, status')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production plan not found or you do not have permission to delete it' });
      }
      throw checkError;
    }
    
    // Check if plan is active - don't allow deletion of active plans
    if (existingPlan.status === 'active') {
      return res.status(400).json({ message: 'Cannot delete an active production plan. Change status to draft or completed first.' });
    }
    
    // Check if there are any orders associated with this plan
    const { count: orderCount, error: orderCountError } = await supabase
      .from('production_orders')
      .select('id', { count: 'exact', head: true })
      .eq('plan_id', id)
      .eq('is_active', true);
      
    if (orderCountError) throw orderCountError;
    
    if (orderCount && orderCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete production plan with existing orders. Please delete the ${orderCount} orders first or change plan status to completed.` 
      });
    }
    
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('production_plans')
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

    return res.status(200).json({ message: 'Production plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting production plan:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get production plan with detailed information
export const getProductionPlanWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    // Get the production plan
    const { data: plan, error: planError } = await supabase
      .from('production_plans')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();

    if (planError) {
      if (planError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production plan not found' });
      }
      throw planError;
    }
    
    // Get associated production orders
    const { data: orders, error: ordersError } = await supabase
      .from('production_orders')
      .select(`
        *,
        product:product_id(id, name, code),
        semi_product:semi_product_id(id, name, code),
        recipe:recipe_id(id, name, code)
      `)
      .eq('plan_id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('start_date', { ascending: true });
      
    if (ordersError) throw ordersError;
    
    // Get order progress statistics
    const orderStatuses = orders ? orders.reduce((acc: any, order: any) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) : {};
    
    const totalOrders = orders ? orders.length : 0;
    const completedOrders = orders ? orders.filter((o: any) => o.status === 'completed').length : 0;
    const planProgress = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    
    // Combine plan with orders and statistics
    const result = {
      ...plan,
      orders: orders || [],
      statistics: {
        totalOrders,
        completedOrders,
        planProgress,
        orderStatuses
      }
    };
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching production plan details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered production plans
export const getFilteredProductionPlans = async (req: Request, res: Response) => {
  try {
    const { status, priority, startDateFrom, startDateTo, endDateFrom, endDateTo, searchTerm } = req.query;
    const companyId = req.user?.companyId;
    
    let query = supabase
      .from('production_plans')
      .select('*')
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
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
    console.error('Error fetching filtered production plans:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update production plan status
export const updateProductionPlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = req.user?.companyId;
    
    // Validate status
    const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Check if production plan exists and belongs to the company
    const { data: existingPlan, error: checkError } = await supabase
      .from('production_plans')
      .select('id, status')
      .eq('id', id)
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Production plan not found or you do not have permission to update it' });
      }
      throw checkError;
    }
    
    // Check current status and validate status transition
    if (existingPlan.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ message: 'Cannot change status of a completed production plan' });
    }
    
    if (existingPlan.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of a cancelled production plan' });
    }
    
    // Update the status
    const { data, error } = await supabase
      .from('production_plans')
      .update({ 
        status,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .select()
      .single();

    if (error) throw error;

    // If status is changed to active, update all draft orders to pending
    if (status === 'active') {
      await supabase
        .from('production_orders')
        .update({ 
          status: 'pending',
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('plan_id', id)
        .eq('status', 'draft')
        .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    }
    
    // If status is changed to completed, update all in-progress orders to completed
    if (status === 'completed') {
      await supabase
        .from('production_orders')
        .update({ 
          status: 'completed',
          progress: 100,
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('plan_id', id)
        .eq('status', 'in_progress')
        .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    }
    
    // If status is changed to cancelled, update all pending and in-progress orders to cancelled
    if (status === 'cancelled') {
      await supabase
        .from('production_orders')
        .update({ 
          status: 'cancelled',
          updated_by: req.user?.id,
          updated_at: new Date()
        })
        .eq('plan_id', id)
        .in('status', ['pending', 'in_progress'])
        .eq(companyId ? 'company_id' : 'id', companyId || 'id');
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating production plan status:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get production plan dashboard data
export const getProductionPlanDashboard = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase.rpc(
      'get_production_plan_counts_by_status',
      { company_id_param: companyId }
    );
    
    if (statusError) throw statusError;
    
    // Get counts by priority
    const { data: priorityCounts, error: priorityError } = await supabase.rpc(
      'get_production_plan_counts_by_priority',
      { company_id_param: companyId }
    );
    
    if (priorityError) throw priorityError;
    
    // Get upcoming plans (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const { data: upcomingPlans, error: upcomingError } = await supabase
      .from('production_plans')
      .select('id, code, name, start_date, end_date, status, priority')
      .eq('is_active', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .gte('start_date', today.toISOString())
      .lte('start_date', thirtyDaysLater.toISOString())
      .order('start_date', { ascending: true })
      .limit(10);
      
    if (upcomingError) throw upcomingError;
    
    // Get active plans
    const { data: activePlans, error: activeError } = await supabase
      .from('production_plans')
      .select('id, code, name, start_date, end_date, status, priority')
      .eq('is_active', true)
      .eq('status', 'active')
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('end_date', { ascending: true })
      .limit(10);
      
    if (activeError) throw activeError;
    
    // Format the response
    const dashboard = {
      statusCounts: statusCounts || [],
      priorityCounts: priorityCounts || [],
      upcomingPlans: upcomingPlans || [],
      activePlans: activePlans || []
    };
    
    return res.status(200).json(dashboard);
  } catch (error: any) {
    console.error('Error fetching production plan dashboard:', error);
    return res.status(500).json({ message: error.message });
  }
};