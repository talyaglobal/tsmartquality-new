import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Product not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    
    // Add user data
    productData.created_by = req.user?.id;
    productData.status = true;
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    
    // Add user data for update
    productData.updated_by = req.user?.id;
    productData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productData.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a product (soft delete)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('products')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create product history entry
    await supabase
      .from('product_history')
      .insert({
        product_id: id,
        change_description: 'Product deleted',
        old_value: 'Status: active',
        new_value: 'Status: deleted',
        created_by: req.user?.id,
        company_id: req.user?.companyId
      });

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product with all details
export const getProductWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brand_id(id, name),
        product_group:product_group_id(id, name),
        product_type:product_type_id(id, name),
        seller:seller_id(id, name),
        storage_condition:storage_condition_id(id, name),
        color_type:color_type_id(id, name),
        cutting_type:cutting_type_id(id, name),
        quality_type:quality_type_id(id, name),
        photos(id, file_name, file_path),
        product_to_customers(id, customer_id, custom_product_code, custom_product_name)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Product not found' });
      }
      throw error;
    }
    
    // Get customers for the product
    if (data && data.product_to_customers && data.product_to_customers.length > 0) {
      const customerIds = data.product_to_customers.map((pc: any) => pc.customer_id);
      
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, name, code')
        .in('id', customerIds)
        .eq('status', true);
        
      if (!customerError && customers) {
        // Add customer details to the product_to_customers array
        data.product_to_customers = data.product_to_customers.map((pc: any) => {
          const customer = customers.find((c: any) => c.id === pc.customer_id);
          return {
            ...pc,
            customer
          };
        });
      }
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all products with details
export const getAllProductsWithDetails = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brand_id(id, name),
        product_group:product_group_id(id, name),
        product_type:product_type_id(id, name)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching products with details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all products with details for web
export const getAllProductsWithDetailsForWeb = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, code, name, description,
        brand:brand_id(id, name),
        product_group:product_group_id(id, name),
        product_type:product_type_id(id, name),
        photos(id, file_path)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response to include only the first photo for each product
    const formattedData = data.map((product: any) => {
      return {
        ...product,
        photo: product.photos && product.photos.length > 0 ? product.photos[0].file_path : null,
        photos: undefined // Remove the photos array
      };
    });

    return res.status(200).json(formattedData);
  } catch (error: any) {
    console.error('Error fetching products for web:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get paginated products with details
export const getPaginatedProductsWithDetails = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', true);
      
    if (countError) throw countError;
    
    // Get paginated data
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brand_id(id, name),
        product_group:product_group_id(id, name),
        product_type:product_type_id(id, name)
      `)
      .eq('status', true)
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
    console.error('Error fetching paginated products:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filtered products with pagination
export const getFilteredProductsWithDetails = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    const { 
      searchTerm, 
      brandId, 
      productGroupId, 
      productTypeId, 
      sellerId,
      isActive 
    } = req.query;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        brand:brand_id(id, name),
        product_group:product_group_id(id, name),
        product_type:product_type_id(id, name),
        seller:seller_id(id, name)
      `)
      .eq('status', true);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
    }
    
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    
    if (productGroupId) {
      query = query.eq('product_group_id', productGroupId);
    }
    
    if (productTypeId) {
      query = query.eq('product_type_id', productTypeId);
    }
    
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }
    
    if (isActive !== undefined) {
      query = query.eq('is_blocked', !isActive);
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
    console.error('Error fetching filtered products:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get filter items for products
export const getProductFilterItems = async (req: Request, res: Response) => {
  try {
    // Use batched query to get all filter items in parallel
    const [
      brandResponse,
      productGroupResponse,
      productTypeResponse,
      sellerResponse,
      storageConditionResponse
    ] = await Promise.all([
      supabase.from('brands').select('id, name').eq('status', true).order('name'),
      supabase.from('product_groups').select('id, name').eq('status', true).order('name'),
      supabase.from('product_types').select('id, name').eq('status', true).order('name'),
      supabase.from('sellers').select('id, name').eq('status', true).order('name'),
      supabase.from('storage_conditions').select('id, name').eq('status', true).order('name')
    ]);
    
    // Check for errors
    if (brandResponse.error) throw brandResponse.error;
    if (productGroupResponse.error) throw productGroupResponse.error;
    if (productTypeResponse.error) throw productTypeResponse.error;
    if (sellerResponse.error) throw sellerResponse.error;
    if (storageConditionResponse.error) throw storageConditionResponse.error;
    
    // Combine all filter items
    const filterItems = {
      brands: brandResponse.data,
      productGroups: productGroupResponse.data,
      productTypes: productTypeResponse.data,
      sellers: sellerResponse.data,
      storageConditions: storageConditionResponse.data
    };

    return res.status(200).json(filterItems);
  } catch (error: any) {
    console.error('Error fetching product filter items:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product dashboard data
export const getProductDashboard = async (req: Request, res: Response) => {
  try {
    // Get company ID from authenticated user
    const companyId = req.user?.companyId;
    
    // Get total product count
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id');
      
    if (countError) throw countError;
    
    // Get products by group
    const { data: productsByGroup, error: groupError } = await supabase
      .from('products')
      .select(`
        product_group:product_group_id(id, name),
        count
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .group('product_group_id, product_group.id, product_group.name');
      
    if (groupError) throw groupError;
    
    // Get products by brand
    const { data: productsByBrand, error: brandError } = await supabase
      .from('products')
      .select(`
        brand:brand_id(id, name),
        count
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .group('brand_id, brand.id, brand.name');
      
    if (brandError) throw brandError;
    
    // Get recent products
    const { data: recentProducts, error: recentError } = await supabase
      .from('products')
      .select(`
        id, name, code, created_at
      `)
      .eq('status', true)
      .eq(companyId ? 'company_id' : 'id', companyId || 'id')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (recentError) throw recentError;
    
    // Format the response
    const dashboard = {
      totalProducts,
      productsByGroup: productsByGroup.map((item: any) => ({
        label: item.product_group ? item.product_group.name : 'Unknown',
        value: parseInt(item.count)
      })),
      productsByBrand: productsByBrand.map((item: any) => ({
        label: item.brand ? item.brand.name : 'Unknown',
        value: parseInt(item.count)
      })),
      recentProducts
    };

    return res.status(200).json(dashboard);
  } catch (error: any) {
    console.error('Error fetching product dashboard data:', error);
    return res.status(500).json({ message: error.message });
  }
};