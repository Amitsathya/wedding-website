import { useState, useRef } from 'react';
import { apiClient } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

export default function PhotoUpload({ onPhotoUploaded, guestToken, guestName }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadPhoto = async (file) => {
    setUploading(true);

    try {
      // Create FormData for direct upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guestName', guestName || 'Anonymous');
      
      if (guestToken) {
        formData.append('guestToken', guestToken);
      }

      // Upload directly to backend (no more S3 CORS issues!)
      const response = await apiClient.post('/api/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onPhotoUploaded?.(response.data);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });

    validFiles.forEach(uploadPhoto);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-primary/5'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <p className="text-lg font-semibold text-foreground">Uploading photos...</p>
            <div className="w-32 h-2 bg-muted rounded-full mx-auto">
              <div className="h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="w-16 h-16 text-primary mx-auto" />
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                Share Your Photos
              </p>
              <p className="text-muted-foreground">
                Drag and drop photos here, or click to select files
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, GIF • Max 10MB per file
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Button
          onClick={handleClick}
          disabled={uploading}
          size="lg"
          className="px-8"
        >
          <Camera className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Choose Photos'}
        </Button>
      </div>
    </div>
  );
}