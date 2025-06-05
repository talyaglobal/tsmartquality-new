import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createProductHistory } from './productHistory.controller';

// Get all product-customer relationships
export const getAllProductToCustomers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('product_to_customers')
      .select(`
        *,
        product:product_id(id, name, code),
        customer:customer_id(id, name, code)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product-customer relationships:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product-customer relationship by ID
export const getProductToCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('product_to_customers')
      .select(`
        *,
        product:product_id(id, name, code),
        customer:customer_id(id, name, code)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Product-customer relationship not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product-customer relationship:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product-customer relationships by product ID
export const getProductToCustomersByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const { data, error } = await supabase
      .from('product_to_customers')
      .select(`
        *,
        customer:customer_id(id, name, code)
      `)
      .eq('product_id', productId)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product-customer relationships for product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product-customer relationships by customer ID
export const getProductToCustomersByCustomerId = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    
    const { data, error } = await supabase
      .from('product_to_customers')
      .select(`
        *,
        product:product_id(id, name, code)
      `)
      .eq('customer_id', customerId)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product-customer relationships for customer:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new product-customer relationship
export const createProductToCustomer = async (req: Request, res: Response) => {
  try {
    const { product_id, customer_id, custom_product_code, custom_product_name } = req.body;
    
    // Check if the relationship already exists
    const { data: existingData, error: existingError } = await supabase
      .from('product_to_customers')
      .select('*')
      .eq('product_id', product_id)
      .eq('customer_id', customer_id)
      .eq('status', true)
      .limit(1);
      
    if (existingError) throw existingError;
    
    if (existingData && existingData.length > 0) {
      return res.status(409).json({ message: 'This product-customer relationship already exists' });
    }
    
    // Add company data
    const relationshipData = {
      product_id,
      customer_id,
      custom_product_code,
      custom_product_name,
      company_id: req.user?.companyId,
      created_by: req.user?.id,
      status: true
    };
    
    const { data, error } = await supabase
      .from('product_to_customers')
      .insert(relationshipData)
      .select()
      .single();

    if (error) throw error;

    // Add to product history
    try {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', product_id)
        .single();
      
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', customer_id)
        .single();
        
      await createProductHistory(
        product_id,
        'Product assigned to customer',
        null,
        `Product "${product?.name}" assigned to customer "${customer?.name}"${custom_product_code ? ` with code "${custom_product_code}"` : ''}`,
        req.user?.id,
        req.user?.companyId
      );
    } catch (historyError) {
      console.error('Error creating product history:', historyError);
      // Continue even if history creation fails
    }

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating product-customer relationship:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a product-customer relationship
export const updateProductToCustomer = async (req: Request, res: Response) => {
  try {
    const { id, product_id, customer_id, custom_product_code, custom_product_name } = req.body;
    
    // If product_id and customer_id are being updated, check for duplicates
    if (product_id && customer_id) {
      const { data: existingData, error: existingError } = await supabase
        .from('product_to_customers')
        .select('*')
        .eq('product_id', product_id)
        .eq('customer_id', customer_id)
        .eq('status', true)
        .neq('id', id)
        .limit(1);
        
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        return res.status(409).json({ message: 'This product-customer relationship already exists' });
      }
    }
    
    // Get the current data before update for history tracking
    const { data: currentData, error: currentError } = await supabase
      .from('product_to_customers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (currentError) throw currentError;
    
    const updateData = {
      custom_product_code,
      custom_product_name,
      updated_by: req.user?.id,
      updated_at: new Date()
    };
    
    // Only update product_id and customer_id if they're provided
    if (product_id) updateData.product_id = product_id;
    if (customer_id) updateData.customer_id = customer_id;
    
    const { data, error } = await supabase
      .from('product_to_customers')
      .update(updateData)
      .eq('id', id)
      .eq('status', true)
      .select()
      .single();

    if (error) throw error;

    // Add to product history
    try {
      let changeDescription = 'Product-customer relationship updated';
      let oldValue = '';
      let newValue = '';
      
      if (currentData.custom_product_code !== custom_product_code) {
        oldValue += `Code: ${currentData.custom_product_code || 'None'}, `;
        newValue += `Code: ${custom_product_code || 'None'}, `;
      }
      
      if (currentData.custom_product_name !== custom_product_name) {
        oldValue += `Name: ${currentData.custom_product_name || 'None'}`;
        newValue += `Name: ${custom_product_name || 'None'}`;
      }
      
      if (oldValue && newValue) {
        await createProductHistory(
          data.product_id,
          changeDescription,
          oldValue,
          newValue,
          req.user?.id,
          req.user?.companyId
        );
      }
    } catch (historyError) {
      console.error('Error creating product history:', historyError);
      // Continue even if history creation fails
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating product-customer relationship:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a product-customer relationship (soft delete)
export const deleteProductToCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the current data before deletion for history tracking
    const { data: currentData, error: currentError } = await supabase
      .from('product_to_customers')
      .select(`
        *,
        product:product_id(name),
        customer:customer_id(name)
      `)
      .eq('id', id)
      .single();
      
    if (currentError) throw currentError;
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('product_to_customers')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    // Add to product history
    try {
      const changeDescription = 'Product removed from customer';
      await createProductHistory(
        currentData.product_id,
        changeDescription,
        `Product "${currentData.product.name}" was assigned to customer "${currentData.customer.name}"`,
        'Relationship removed',
        req.user?.id,
        req.user?.companyId
      );
    } catch (historyError) {
      console.error('Error creating product history:', historyError);
      // Continue even if history creation fails
    }

    return res.status(200).json({ message: 'Product-customer relationship deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product-customer relationship:', error);
    return res.status(500).json({ message: error.message });
  }
};