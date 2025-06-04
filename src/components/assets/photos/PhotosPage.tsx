import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import PhotoGrid from './PhotoGrid';
import PhotoFilters from './PhotoFilters';
import PhotoUploadModal from './PhotoUploadModal';

const PhotosPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);

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
        <PhotoFilters onFilterChange={handleFilterChange} />
        <PhotoGrid />
      </Card>

      {showUploadModal && (
        <PhotoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default PhotosPage;