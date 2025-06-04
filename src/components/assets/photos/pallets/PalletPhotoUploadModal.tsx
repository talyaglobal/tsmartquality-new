import React, { useState } from 'react';
import { Upload, X, Package } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

interface PalletPhotoUploadModalProps {
  onClose: () => void;
  onUpload: (files: File[], metadata: any) => void;
}

const PalletPhotoUploadModal: React.FC<PalletPhotoUploadModalProps> = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState({
    title: '',
    palletType: '',
    view: '',
    description: '',
    loadCapacity: '',
    tags: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(files, metadata);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload Pallet Photos</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-[var(--primary-main)] bg-[var(--primary-main)] bg-opacity-5' : 'border-[var(--divider)]'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {isDragActive ? 'Drop the files here' : 'Drag & drop pallet photos here, or click to select'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-[var(--background-default)] rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="title"
              label="Title"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Pallet Type
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                value={metadata.palletType}
                onChange={(e) => setMetadata({ ...metadata, palletType: e.target.value })}
                required
              >
                <option value="">Select Pallet Type</option>
                <option value="euro">Euro Pallet</option>
                <option value="block">Block Pallet</option>
                <option value="stringer">Stringer Pallet</option>
                <option value="custom">Custom Pallet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                View Type
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                value={metadata.view}
                onChange={(e) => setMetadata({ ...metadata, view: e.target.value })}
                required
              >
                <option value="">Select View</option>
                <option value="front">Front View</option>
                <option value="side">Side View</option>
                <option value="top">Top View</option>
                <option value="loaded">Loaded</option>
                <option value="empty">Empty</option>
                <option value="3d">3D View</option>
              </select>
            </div>
            <Input
              label="Load Capacity"
              placeholder="e.g., 1500 kg"
              value={metadata.loadCapacity}
              onChange={(e) => setMetadata({ ...metadata, loadCapacity: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            multiline
            rows={3}
          />

          <Input
            label="Tags (comma-separated)"
            value={metadata.tags}
            onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
            placeholder="e.g., euro, loaded, warehouse"
          />

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={files.length === 0}
              icon={<Package size={20} />}
            >
              Upload Photos
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PalletPhotoUploadModal;