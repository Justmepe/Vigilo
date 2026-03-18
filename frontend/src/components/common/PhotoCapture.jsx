/* eslint-disable no-console */
/**
 * Camera/Photo Capture Component
 * Handles camera access, photo capture, and image management
 */

import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, Check, AlertCircle, Upload } from 'lucide-react';

const PhotoCapture = ({ onPhotoCapture, onCaptionUpdate, onPhotoDelete, label = 'Capture Photo', maxImages = 5 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Initialize camera with robust error handling
   */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log('[CAMERA] Starting camera...');

      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Get the stream FIRST before showing UI
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log('[CAMERA] Stream acquired');
      } catch (err) {
        console.warn('[CAMERA] Ideal constraints failed, trying basic');
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        });
        console.log('[CAMERA] Stream acquired (basic)');
      }

      // Store stream in a ref so it persists
      if (!videoRef.current) {
        videoRef.current = {};
      }
      videoRef.current._stream = stream;

      // NOW set active so video element renders
      setIsCameraActive(true);
      console.log('[CAMERA] Camera UI activated, waiting for DOM...');

      // Wait for React to render the video element
      // This needs to be long enough for React to batch update and render
      await new Promise(resolve => setTimeout(resolve, 500));

      if (videoRef.current && videoRef.current.nodeType) {
        console.log('[CAMERA] Attaching stream to video element');
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Force styles
        videoRef.current.style.display = 'block';
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.objectFit = 'cover';
        videoRef.current.style.backgroundColor = '#000';
        
        console.log('[CAMERA] Stream attached, starting playback');
        
        // Play the video
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('[CAMERA] ✓ Video playing');
          }
        } catch (playErr) {
          console.error('[CAMERA] play() error:', playErr.message);
        }
        
        // Wait for frames to render
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[CAMERA] ✓ Ready to capture');
      } else {
        console.error('[CAMERA] Video ref still not available!');
      }
    } catch (err) {
      let errorMessage = err.message || 'Failed to access camera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another app or tab. Please close them and try again.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Security error: Camera access blocked. This page must be served over HTTPS.';
      }
      
      setError(errorMessage);
      setIsCameraActive(false);
      console.error('[CAMERA] Error:', err);
    }
  }, []);

  /**
   * Stop camera
   */
  const stopCamera = useCallback(() => {
    console.log('[CAMERA] Stopping camera...');
    
    // Stop all tracks
    if (videoRef.current?._stream) {
      videoRef.current._stream.getTracks().forEach(track => {
        track.stop();
        console.log('[CAMERA] Track stopped');
      });
      videoRef.current._stream = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    console.log('[CAMERA] Camera stopped');
  }, []);

  /**
   * Capture photo from video
   */
  const capturePhoto = useCallback(() => {
    try {
      setError(null);

      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Camera not initialized');
      }

      const video = videoRef.current;
      
      // Verify video dimensions are available
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video stream not ready. Please wait a moment and try again.');
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Convert to blob and add to captured photos
      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          setError('Failed to capture photo');
          return;
        }

        if (capturedPhotos.length >= maxImages) {
          setError(`Maximum ${maxImages} photos allowed`);
          return;
        }

        const file = new File(
          [blob],
          `photo-${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        );

        const photoObj = {
          id: Date.now(),
          file,
          preview: URL.createObjectURL(blob),
          timestamp: new Date(),
          caption: ''
        };

        setCapturedPhotos(prev => [...prev, photoObj]);
        onPhotoCapture(photoObj);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError(err.message || 'Failed to capture photo');
      // eslint-disable-next-line no-console
      console.error('Photo capture error:', err);
    }
  }, [capturedPhotos, onPhotoCapture, maxImages]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - supports high-resolution photos

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('❌ Please select only image files (JPG, PNG, etc.)');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        setError(`❌ File too large: ${fileSizeMB}MB (max ${maxSizeMB}MB). Please reduce image size or compress.`);
        return;
      }

      if (capturedPhotos.length >= maxImages) {
        setError(`❌ Maximum ${maxImages} photos allowed`);
        return;
      }

      const preview = URL.createObjectURL(file);
      const photoObj = {
        id: Date.now(),
        file,
        preview,
        timestamp: new Date(),
        caption: ''
      };

      setCapturedPhotos(prev => [...prev, photoObj]);
      onPhotoCapture(photoObj);
    });
  }, [capturedPhotos, onPhotoCapture, maxImages]);

  /**
   * Delete captured photo
   */
  const deletePhoto = useCallback((photoId) => {
    setCapturedPhotos(prev =>
      prev.filter(photo => {
        if (photo.id === photoId) {
          URL.revokeObjectURL(photo.preview);
          return false;
        }
        return true;
      })
    );
    // Notify parent of photo deletion
    if (onPhotoDelete) {
      onPhotoDelete(photoId);
    }
  }, [onPhotoDelete]);

  /**
   * Update photo caption
   */
  const updateCaption = useCallback((photoId, caption) => {
    setCapturedPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId ? { ...photo, caption } : photo
      )
    );
    // Notify parent of caption change
    if (onCaptionUpdate) {
      onCaptionUpdate(photoId, caption);
    }
  }, [onCaptionUpdate]);

  return (
    <div className="photo-capture-container bg-white rounded-lg border border-gray-300 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera size={20} />
        {label}
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Camera Section */}
      <div className="mb-4">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Open Camera
          </button>
        ) : (
          <>
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{
              height: 'min(55vh, 380px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition flex items-center justify-center gap-2"
              >
                <X size={18} />
                Close Camera
              </button>
            </div>
          </>
        )}
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <strong>📸 Photo Requirements:</strong>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>Maximum file size: <strong>25MB</strong> per photo (supports high-resolution images)</li>
            <li>Supported formats: JPG, PNG, GIF, WebP</li>
            <li>Maximum <strong>{maxImages} photos</strong> per form</li>
            <li>📱 Tip: Camera or smartphone photos are typically 2-10MB</li>
          </ul>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded p-4 text-center transition"
        >
          <Upload size={24} className="inline mr-2 text-gray-600" />
          <span className="text-gray-600">or select from files</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Captured Photos Preview */}
      {capturedPhotos.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">
            Captured Photos ({capturedPhotos.length}/{maxImages})
          </h4>
          <div className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
            💡 <strong>Tip:</strong> Add a description for each photo to provide context and reference in the report.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capturedPhotos.map(photo => (
              <div key={photo.id} className="border rounded-lg overflow-hidden">
                <img
                  src={photo.preview}
                  alt="Captured"
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 bg-gray-50">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    📝 Photo Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'Safety hazard near door', 'Equipment damage'"
                    value={photo.caption}
                    onChange={(e) => updateCaption(photo.id, e.target.value)}
                    className="w-full text-sm px-2 py-1 border rounded mb-2"
                  />
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="w-full px-2 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                  >
                    <X size={14} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoCapture;
