import React from 'react';
import { MapPin, Save } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const AddLocationPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Add New Location</h1>
          <p className="text-[var(--text-secondary)]">
            Create a new warehouse or storage location
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location Name"
              required
            />
            <Input
              label="Location Code"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Location Type
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                required
              >
                <option value="">Select Type</option>
                <option value="warehouse">Warehouse</option>
                <option value="distribution">Distribution Center</option>
                <option value="storage">Storage Facility</option>
                <option value="retail">Retail Location</option>
              </select>
            </div>
            <Input
              label="Total Area (sq ft)"
              type="number"
              required
            />
            <Input
              label="Storage Capacity"
              type="number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Manager Name"
              required
            />
            <Input
              label="Contact Number"
              type="tel"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email"
              type="email"
              required
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Operating Hours
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                required
              >
                <option value="">Select Hours</option>
                <option value="24-7">24/7</option>
                <option value="business">Business Hours (9-5)</option>
                <option value="custom">Custom Hours</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Address"
              multiline
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="City"
              required
            />
            <Input
              label="State/Province"
              required
            />
            <Input
              label="Postal Code"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              required
            />
          </div>

          <div>
            <Input
              label="Additional Notes"
              multiline
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={<Save size={20} />}
            >
              Save Location
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddLocationPage;