import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Customer not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    
    // Add user data
    customerData.created_by = req.user?.id;
    customerData.status = true;
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    
    // Add user data for update
    customerData.updated_by = req.user?.id;
    customerData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', customerData.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a customer (soft delete)
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered customers with pagination
export const getFilteredCustomers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    const { 
      searchTerm, 
      category, 
      rating,
      strategic
    } = req.query;
    
    let query = supabase
      .from('customers')
      .select('*')
      .eq('status', true);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (rating) {
      query = query.eq('rating', rating);
    }
    
    if (strategic !== undefined) {
      query = query.eq('strategic', strategic === 'true');
    }
    
    // Get total count with filters
    const { count: totalCount, error: countError } = await query.select('*', { count: 'exact', head: true });
      
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
    console.error('Error fetching filtered customers:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get customer filter items
export const getCustomerFilterItems = async (req: Request, res: Response) => {
  try {
    // Get customer categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('customers')
      .select('category')
      .eq('status', true)
      .is('category', 'not.null')
      .order('category');
      
    if (categoryError) throw categoryError;
    
    // Get unique categories
    const categories = [...new Set(categoryData.map(item => item.category))];
    
    // Create filter items
    const filterItems = {
      categories: categories.map(category => ({
        id: category,
        name: category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      })),
      ratings: [1, 2, 3, 4, 5].map(rating => ({
        id: rating,
        name: `${rating} Star${rating > 1 ? 's' : ''}`
      })),
      strategic: [
        { id: true, name: 'Strategic' },
        { id: false, name: 'Non-Strategic' }
      ]
    };

    return res.status(200).json(filterItems);
  } catch (error: any) {
    console.error('Error fetching customer filter items:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get customer with products
export const getCustomerWithProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();
      
    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Customer not found' });
      }
      throw customerError;
    }
    
    // Get customer products
    const { data: customerProducts, error: productsError } = await supabase
      .from('product_to_customers')
      .select(`
        id, 
        custom_product_code, 
        custom_product_name,
        product:product_id(
          id, 
          code, 
          name, 
          brand:brand_id(id, name)
        )
      `)
      .eq('customer_id', id)
      .eq('status', true);
      
    if (productsError) throw productsError;
    
    // Combine data
    const result = {
      ...customer,
      products: customerProducts
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching customer with products:', error);
    return res.status(500).json({ message: error.message });
  }
};