import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all specifications
 */
export const getAllSpecs = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('specs')
      .select('*', { count: 'exact' })
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({
      success: true,
      data,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all specifications with their details
 */
export const getAllSpecsWithDetails = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // Get specs with count
    const { data: specs, error: specsError, count } = await supabase
      .from('specs')
      .select('*', { count: 'exact' })
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (specsError) {
      return res.status(400).json({ success: false, error: specsError.message });
    }
    
    if (!specs || specs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        limit: Number(limit),
        offset: Number(offset)
      });
    }
    
    // Get spec IDs
    const specIds = specs.map(spec => spec.id);
    
    // Get spec details for these specs
    const { data: specDetails, error: detailsError } = await supabase
      .from('spec_details')
      .select('*')
      .eq('company_id', req.user.company_id)
      .in('spec_id', specIds);
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // Get product information for specs
    const { data: productsInfo, error: productsError } = await supabase
      .from('products')
      .select('id, name, code')
      .eq('company_id', req.user.company_id)
      .in('id', specs.filter(s => s.product_id).map(s => s.product_id));
    
    if (productsError) {
      return res.status(400).json({ 
        success: false, 
        error: productsError.message
      });
    }
    
    // Map products to lookup objects
    const productsMap = (productsInfo || []).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    
    // Group spec details by spec_id
    const detailsBySpecId = (specDetails || []).reduce((acc, curr) => {
      if (!acc[curr.spec_id]) {
        acc[curr.spec_id] = [];
      }
      acc[curr.spec_id].push(curr);
      return acc;
    }, {});
    
    // Combine specs with their details and related information
    const specsWithDetails = specs.map(spec => ({
      ...spec,
      product: spec.product_id ? productsMap[spec.product_id] : null,
      spec_details: detailsBySpecId[spec.id] || []
    }));
    
    return res.status(200).json({
      success: true,
      data: specsWithDetails,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a specification with its details by ID
 */
export const getSpecWithDetails = async (req: Request, res: Response) => {
  try {
    const { specId } = req.params;
    
    // Get the spec
    const { data: spec, error: specError } = await supabase
      .from('specs')
      .select('*')
      .eq('id', specId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (specError) {
      return res.status(404).json({ success: false, error: 'Specification not found' });
    }
    
    // Get spec details
    const { data: specDetails, error: detailsError } = await supabase
      .from('spec_details')
      .select('*')
      .eq('spec_id', specId)
      .eq('company_id', req.user.company_id)
      .order('sequence', { ascending: true });
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // Get product information if associated
    let product = null;
    
    if (spec.product_id) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, code')
        .eq('id', spec.product_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (!productError) {
        product = productData;
      }
    }
    
    // Combine spec with its details and related information
    const specWithDetails = {
      ...spec,
      product,
      spec_details: specDetails || []
    };
    
    return res.status(200).json({
      success: true,
      data: specWithDetails
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a specification by ID
 */
export const getSpecById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('specs')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Specification not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new specification
 */
export const createSpec = async (req: Request, res: Response) => {
  try {
    const { 
      code, 
      name, 
      description, 
      product_id
    } = req.body;
    
    // Create the specification
    const { data, error } = await supabase
      .from('specs')
      .insert({
        code,
        name,
        description,
        product_id: product_id || null,
        company_id: req.user.company_id,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update a specification
 */
export const updateSpec = async (req: Request, res: Response) => {
  try {
    const { 
      id,
      code, 
      name, 
      description, 
      product_id,
      status 
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Specification ID is required' });
    }
    
    // Check if the spec exists and belongs to the company
    const { data: existingSpec, error: checkError } = await supabase
      .from('specs')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Specification not found' });
    }
    
    // Update the specification
    const { data, error } = await supabase
      .from('specs')
      .update({
        code: code || existingSpec.code,
        name: name || existingSpec.name,
        description: description !== undefined ? description : existingSpec.description,
        product_id: product_id !== undefined ? product_id : existingSpec.product_id,
        status: status !== undefined ? status : existingSpec.status,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a specification
 */
export const deleteSpec = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if spec has associated spec details
    const { data: specDetails, error: detailsError } = await supabase
      .from('spec_details')
      .select('id')
      .eq('spec_id', id)
      .eq('company_id', req.user.company_id)
      .limit(1);
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // If spec has details, delete them first
    if (specDetails && specDetails.length > 0) {
      const { error: deleteDetailsError } = await supabase
        .from('spec_details')
        .delete()
        .eq('spec_id', id)
        .eq('company_id', req.user.company_id);
      
      if (deleteDetailsError) {
        return res.status(400).json({ success: false, error: deleteDetailsError.message });
      }
    }
    
    // Delete the specification
    const { error } = await supabase
      .from('specs')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.company_id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, message: 'Specification deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get specifications by product ID
 */
export const getSpecsByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('specs')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({
      success: true,
      data,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all specification details for a specification
 */
export const getSpecDetails = async (req: Request, res: Response) => {
  try {
    const { specId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Check if the spec exists and belongs to the company
    const { data: spec, error: specError } = await supabase
      .from('specs')
      .select('id')
      .eq('id', specId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (specError) {
      return res.status(404).json({ success: false, error: 'Specification not found' });
    }
    
    // Get spec details
    const { data, error, count } = await supabase
      .from('spec_details')
      .select('*', { count: 'exact' })
      .eq('spec_id', specId)
      .eq('company_id', req.user.company_id)
      .order('sequence', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({
      success: true,
      data,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a specification detail by ID
 */
export const getSpecDetailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('spec_details')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Specification detail not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new specification detail
 */
export const createSpecDetail = async (req: Request, res: Response) => {
  try {
    const { 
      spec_id, 
      parameter_name, 
      min_value, 
      max_value, 
      target_value,
      unit,
      is_mandatory,
      sequence
    } = req.body;
    
    // Check that spec_id is provided
    if (!spec_id) {
      return res.status(400).json({ success: false, error: 'Specification ID is required' });
    }
    
    // Check if the spec exists and belongs to the company
    const { data: spec, error: specError } = await supabase
      .from('specs')
      .select('id')
      .eq('id', spec_id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (specError) {
      return res.status(404).json({ success: false, error: 'Specification not found' });
    }
    
    // Get the max sequence number for this spec if sequence is not provided
    let nextSequence = sequence;
    if (nextSequence === undefined) {
      const { data: maxSequence } = await supabase
        .from('spec_details')
        .select('sequence')
        .eq('spec_id', spec_id)
        .eq('company_id', req.user.company_id)
        .order('sequence', { ascending: false })
        .limit(1);
      
      nextSequence = maxSequence && maxSequence.length > 0 ? maxSequence[0].sequence + 10 : 10;
    }
    
    // Create the spec detail
    const { data, error } = await supabase
      .from('spec_details')
      .insert({
        spec_id,
        parameter_name,
        min_value: min_value || null,
        max_value: max_value || null,
        target_value: target_value || null,
        unit: unit || null,
        is_mandatory: is_mandatory !== undefined ? is_mandatory : false,
        sequence: nextSequence,
        company_id: req.user.company_id,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update a specification detail
 */
export const updateSpecDetail = async (req: Request, res: Response) => {
  try {
    const { 
      id,
      spec_id, 
      parameter_name, 
      min_value, 
      max_value, 
      target_value,
      unit,
      is_mandatory,
      sequence,
      status
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Specification detail ID is required' });
    }
    
    // Check if the spec detail exists and belongs to the company
    const { data: existingDetail, error: checkError } = await supabase
      .from('spec_details')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Specification detail not found' });
    }
    
    // Check if the spec_id is changing and if so, verify the new spec exists and belongs to the company
    if (spec_id && spec_id !== existingDetail.spec_id) {
      const { data: spec, error: specError } = await supabase
        .from('specs')
        .select('id')
        .eq('id', spec_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (specError) {
        return res.status(404).json({ success: false, error: 'Specification not found' });
      }
    }
    
    // Update the spec detail
    const { data, error } = await supabase
      .from('spec_details')
      .update({
        spec_id: spec_id || existingDetail.spec_id,
        parameter_name: parameter_name || existingDetail.parameter_name,
        min_value: min_value !== undefined ? min_value : existingDetail.min_value,
        max_value: max_value !== undefined ? max_value : existingDetail.max_value,
        target_value: target_value !== undefined ? target_value : existingDetail.target_value,
        unit: unit !== undefined ? unit : existingDetail.unit,
        is_mandatory: is_mandatory !== undefined ? is_mandatory : existingDetail.is_mandatory,
        sequence: sequence !== undefined ? sequence : existingDetail.sequence,
        status: status !== undefined ? status : existingDetail.status,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a specification detail
 */
export const deleteSpecDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('spec_details')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.company_id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, message: 'Specification detail deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};