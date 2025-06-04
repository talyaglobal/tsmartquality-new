import React, { useState } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import ProductPhotoGrid from './ProductPhotoGrid';
import ProductPhotoFilters from './ProductPhotoFilters';
import ProductPhotoUploadModal from './ProductPhotoUploadModal';

const ProductPhotosPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleUpload = (files: File[], metadata: any) => {
    console.log('Uploading files:', files, metadata);
    setShowUploadModal(false);
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Product Photos</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize your product photography assets
          </p>
        </div>
        <Button 
          icon={<Upload size={20} />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Photos
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search photos..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export</Button>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6">
            <ProductPhotoFilters onFilterChange={handleFilterChange} />
          </div>
        )}

        <ProductPhotoGrid />
      </Card>

      {showUploadModal && (
        <ProductPhotoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default ProductPhotosPage;