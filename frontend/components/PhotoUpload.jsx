import { useState, useRef } from 'react';
import { apiClient } from '../lib/api';

export default function PhotoUpload({ onPhotoUploaded, guestToken, guestName }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadPhoto = async (file) => {
    setUploading(true);

    try {
      // Get presigned upload URL
      const urlResponse = await apiClient.post('/api/photos/upload-url', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        guestToken: guestToken,
        guestName: guestName
      });

      const { uploadUrl, photoId } = urlResponse.data;

      // Upload file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Mark upload as complete
      const completeResponse = await apiClient.post('/api/photos/complete', {
        photoId,
        fileName: file.name
      });

      onPhotoUploaded?.(completeResponse.data);
      
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
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-gray-400'}
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
          <div className="space-y-2">
            <div className="text-xl">📤</div>
            <p className="text-lg font-semibold text-gray-700">Uploading photos...</p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
              <div className="h-2 bg-rose-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-lg font-semibold text-gray-700">
              Share Your Photos
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop photos here, or click to select files
            </p>
            <p className="text-xs text-gray-400">
              Supports JPG, PNG, GIF • Max 10MB per file
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleClick}
          disabled={uploading}
          className="bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Choose Photos'}
        </button>
      </div>
    </div>
  );
}