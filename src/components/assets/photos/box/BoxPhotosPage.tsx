import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import BoxPhotoGrid from './BoxPhotoGrid';
import BoxPhotoFilters from './BoxPhotoFilters';
import BoxPhotoUploadModal from './BoxPhotoUploadModal';

const BoxPhotosPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold mb-1">Box Photos</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize your box and packaging photography assets
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
        <BoxPhotoFilters onFilterChange={handleFilterChange} />
        <BoxPhotoGrid />
      </Card>

      {showUploadModal && (
        <BoxPhotoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default BoxPhotosPage;