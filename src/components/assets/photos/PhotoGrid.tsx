import React from 'react';
import { Eye, Download, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import Button from '../../ui/Button';

interface Photo {
  id: string;
  url: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string;
  dimensions: string;
  category: string;
}

const PhotoGrid: React.FC = () => {
  // Sample data - replace with actual data from your API
  const photos: Photo[] = [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg',
      title: 'Product Package Front',
      type: 'jpg',
      size: '2.4 MB',
      uploadedAt: '2024-03-15',
      dimensions: '1920x1080',
      category: 'Packaging'
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/4483608/pexels-photo-4483608.jpeg',
      title: 'Product Lifestyle Shot',
      type: 'png',
      size: '3.1 MB',
      uploadedAt: '2024-03-14',
      dimensions: '2400x1600',
      category: 'Lifestyle'
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/5025669/pexels-photo-5025669.jpeg',
      title: 'Product Detail',
      type: 'jpg',
      size: '1.8 MB',
      uploadedAt: '2024-03-13',
      dimensions: '3000x2000',
      category: 'Products'
    }
  ];

  const handleView = (photo: Photo) => {
    console.log('View photo:', photo);
  };

  const handleDownload = (photo: Photo) => {
    console.log('Download photo:', photo);
  };

  const handleEdit = (photo: Photo) => {
    console.log('Edit photo:', photo);
  };

  const handleDelete = (photo: Photo) => {
    console.log('Delete photo:', photo);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-[var(--background-paper)] rounded-lg shadow overflow-hidden group"
        >
          <div className="relative aspect-video">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Eye size={16} />}
                onClick={() => handleView(photo)}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
                onClick={() => handleDownload(photo)}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Download
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1">{photo.title}</h3>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{photo.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{photo.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{photo.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-medium">{photo.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span className="font-medium">{photo.uploadedAt}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={16} />}
                onClick={() => handleEdit(photo)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(photo)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;