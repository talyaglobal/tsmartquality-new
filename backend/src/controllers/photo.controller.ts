import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { StorageError } from '@supabase/storage-js';
import { customAlphabet } from 'nanoid';
import path from 'path';

// Generate unique IDs for files
const nanoid = customAlphabet('1234567890abcdef', 16);

/**
 * Get all photos with optional filtering
 */
export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0, productId } = req.query;
    
    let query = supabase
      .from('photos')
      .select('*')
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false });
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    const { data, error, count } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .select('*', { count: 'exact' });
    
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
 * Get a single photo by ID
 */
export const getPhotoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Upload a new photo
 */
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    
    const { productId, title, description } = req.body;
    const file = req.file;
    
    // Generate a unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${nanoid()}${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('product-photos')
      .upload(`${req.user.company_id}/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (uploadError) {
      return res.status(400).json({ success: false, error: uploadError.message });
    }
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('product-photos')
      .getPublicUrl(`${req.user.company_id}/${fileName}`);
    
    // Create a record in the photos table
    const { data, error } = await supabase
      .from('photos')
      .insert({
        product_id: productId || null,
        company_id: req.user.company_id,
        title: title || file.originalname,
        description: description || '',
        file_path: uploadData.path,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        url: urlData.publicUrl,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      // If there's an error with the database, try to delete the uploaded file
      await supabase
        .storage
        .from('product-photos')
        .remove([`${req.user.company_id}/${fileName}`]);
      
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update photo details
 */
export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { id, title, description, productId } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Photo ID is required' });
    }
    
    // Check if the photo exists and belongs to the company
    const { data: existingPhoto, error: checkError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }
    
    // Update the photo record
    const { data, error } = await supabase
      .from('photos')
      .update({
        title: title || existingPhoto.title,
        description: description !== undefined ? description : existingPhoto.description,
        product_id: productId !== undefined ? productId : existingPhoto.product_id,
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
 * Delete a photo
 */
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the photo details first
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }
    
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('product-photos')
      .remove([photo.file_path]);
    
    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.company_id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get photos by product ID
 */
export const getPhotosByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('photos')
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
 * Associate a photo with a product
 */
export const associatePhotoWithProduct = async (req: Request, res: Response) => {
  try {
    const { photoId, productId } = req.body;
    
    if (!photoId || !productId) {
      return res.status(400).json({ success: false, error: 'Photo ID and Product ID are required' });
    }
    
    // Check if the photo exists and belongs to the company
    const { data: existingPhoto, error: checkError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }
    
    // Check if the product exists and belongs to the company
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (productError) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Update the photo record to associate with the product
    const { data, error } = await supabase
      .from('photos')
      .update({
        product_id: productId,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', photoId)
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
