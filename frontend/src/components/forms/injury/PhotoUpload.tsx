import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onChange, label = "Photos", maxPhotos = 10 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange([...photos, base64String]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-slate-500">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
}
