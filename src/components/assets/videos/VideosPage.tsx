import React, { useState } from 'react';
import { Plus, Search, Video, Play, Pause, Download, Trash2, Edit, Upload } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  size: string;
  uploadedAt: string;
  category: string;
  format: string;
  resolution: string;
}

const VideosPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  // Sample data - replace with actual data from your API
  const videos: Video[] = [
    {
      id: '1',
      title: 'Product Manufacturing Process',
      description: 'Step-by-step manufacturing process video',
      url: 'https://example.com/video1.mp4',
      thumbnail: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg',
      duration: '2:30',
      size: '15.4 MB',
      uploadedAt: '2024-03-15',
      category: 'Manufacturing',
      format: 'MP4',
      resolution: '1920x1080'
    },
    {
      id: '2',
      title: 'Quality Control Process',
      description: 'Quality control and inspection procedures',
      url: 'https://example.com/video2.mp4',
      thumbnail: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
      duration: '3:45',
      size: '22.7 MB',
      uploadedAt: '2024-03-14',
      category: 'Quality Control',
      format: 'MP4',
      resolution: '1920x1080'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Video Library</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize your product and process videos
          </p>
        </div>
        <Button 
          icon={<Upload size={20} />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Video
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search videos..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Categories</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="quality">Quality Control</option>
              <option value="training">Training</option>
              <option value="marketing">Marketing</option>
            </select>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-[var(--background-paper)] rounded-lg shadow overflow-hidden"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => setPlaying(video.id === playing ? null : video.id)}
                >
                  {video.id === playing ? (
                    <Pause size={48} className="text-white" />
                  ) : (
                    <Play size={48} className="text-white" />
                  )}
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium mb-1">{video.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {video.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">Duration: </span>
                    <span className="font-medium">{video.duration}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Size: </span>
                    <span className="font-medium">{video.size}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Format: </span>
                    <span className="font-medium">{video.format}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Resolution: </span>
                    <span className="font-medium">{video.resolution}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download size={16} />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Upload Video</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[var(--primary-main)] transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Drag & drop video files here, or click to select
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Supported formats: MP4, MOV, AVI
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="quality">Quality Control</option>
                    <option value="training">Training</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <Input
                label="Description"
                multiline
                rows={3}
              />

              <Input
                label="Tags (comma-separated)"
                placeholder="e.g., manufacturing, process, quality"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  icon={<Upload size={20} />}
                >
                  Upload Video
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;