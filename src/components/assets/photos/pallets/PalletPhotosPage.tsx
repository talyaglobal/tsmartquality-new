import React, { useState } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import PalletPhotoGrid from './PalletPhotoGrid';
import PalletPhotoFilters from './PalletPhotoFilters';
import PalletPhotoUploadModal from './PalletPhotoUploadModal';

const PalletPhotosPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold mb-1">Pallet Photos</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize your pallet and load unit photography assets
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
        <PalletPhotoFilters onFilterChange={handleFilterChange} />
        <PalletPhotoGrid />
      </Card>

      {showUploadModal && (
        <PalletPhotoUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default PalletPhotosPage;