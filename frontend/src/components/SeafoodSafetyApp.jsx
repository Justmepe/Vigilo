/* eslint-disable no-console */
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Download, Upload, Search, FileText, Users, BookOpen, Settings, CheckCircle, AlertTriangle, Clock, User, Shield, Edit3, LogOut, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { FORM_REGISTRY } from './forms/FormRegistry';
import {
  SEAFOOD_SPECIES,
  WORK_AREAS,

  PPE_OPTIONS,
} from '../data/seafoodOperationsData';

const SeafoodSafetyManagerApp = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedForm, setSelectedForm] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [photos, setPhotos] = useState({});
  const [cameraActive, setCameraActive] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [logoViewModel, setLogoViewModel] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successNotification, setSuccessNotification] = useState(null);
  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionData, setRevisionData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    inspectionsThisWeek: 0,
    pendingActionItems: 0,
    reportsThisMonth: 0,
    recentActivity: []
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const fileInputRef = React.useRef({});
  const logoInputRef = React.useRef(null);

  // eslint-disable-next-line no-unused-vars
  const formTemplates = {
    jsa: {
      name: 'Job Safety Analysis (JSA)',
      icon: Shield,
      sections: [
        {
          title: 'Basic Information',
          fields: [
            { name: 'jobTitle', label: 'Job Title', type: 'select', options: [
              'Case-Up Personnel', 'Chief Engineer', 'Crane Operators', 'Dock Personnel',
              'Egg House', 'Electricians', 'Forklift Drivers', 'Freezer Personnel',
              'General Processors', 'Graders', 'Maintenance', 'Production Leads',
              'QA', 'Refrigeration Personnel', 'Retort Operator', 'Rolling Stock',
              'Sanitation', 'Shipping/Receiving', 'Supervisors/Managers', 'Tank Personnel',
              'Trimmers and Knife Handler', 'Welders', 'Fish Cutter/Trimmer', 'Filleting Operator'
            ]},
            { name: 'species', label: 'Seafood Species', type: 'select', options: SEAFOOD_SPECIES.map(s => s.label)},
            { name: 'workArea', label: 'Work Area Type', type: 'select', options: WORK_AREAS.map(a => a.label)},
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'supervisor', label: 'Supervisor', type: 'text' }
          ]
        },
        {
          title: 'Required PPE',
          fields: [
            { name: 'requiredPPE', label: 'Required PPE by Job', type: 'multiselect', options: PPE_OPTIONS.map(p => p.label)},
          ]
        },
        {
          title: 'Hazard Analysis',
          repeatable: true,
          fields: [
            { name: 'stepDescription', label: 'Step Description', type: 'textarea' },
            { name: 'hazards', label: 'Identified Hazards', type: 'textarea' },
            { name: 'controls', label: 'Control Measures', type: 'textarea' },
            { name: 'photo', label: 'Photo Evidence', type: 'camera' }
          ]
        }
      ]
    },
    injury: {
      name: 'Employee Injury & Illness Report',
      icon: AlertTriangle,
      sections: [
        {
          title: 'Employee Information',
          fields: [
            { name: 'employeeName', label: 'Employee Name', type: 'text' },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
            { name: 'incidentDateTime', label: 'Date & Time of Incident', type: 'datetime-local' },
            { name: 'phone', label: 'Phone Number', type: 'tel' },
            { name: 'email', label: 'Email Address', type: 'email' }
          ]
        },
        {
          title: 'Incident Details',
          fields: [
            { name: 'jobTitle', label: 'Job Title', type: 'text' },
            { name: 'bodyPartInjured', label: 'What Part of Your Body Was Injured?', type: 'textarea' },
            { name: 'incidentDescription', label: 'How Did the Incident Happen?', type: 'textarea' },
            { name: 'locationOfIncident', label: 'Where Were You When This Happened?', type: 'text' },
            { name: 'photo', label: 'Photo of Injury/Scene', type: 'camera' }
          ]
        }
      ]
    },
    spillReport: {
      name: 'Emergency Spill/Release Report',
      icon: AlertTriangle,
      sections: [
        {
          title: 'Incident Information',
          fields: [
            { name: 'incidentDate', label: 'Incident Date', type: 'date' },
            { name: 'incidentTime', label: 'Incident Time (24hr)', type: 'time' },
            { name: 'incidentAddress', label: 'Incident Address', type: 'text' },
            { name: 'city', label: 'City/Community', type: 'text' }
          ]
        },
        {
          title: 'Chemical Information',
          fields: [
            { name: 'chemicalName', label: 'Chemical or Trade Name', type: 'text' },
            { name: 'casNumber', label: 'CAS Number', type: 'text' },
            { name: 'quantityReleased', label: 'Quantity Released', type: 'text' },
            { name: 'photo', label: 'Photo of Spill/Release', type: 'camera' }
          ]
        }
      ]
    },
    monthlyInspection: {
      name: 'Monthly Hygiene Inspection',
      icon: CheckCircle,
      sections: [
        {
          title: 'Inspection Details',
          fields: [
            { name: 'date', label: 'Inspection Date', type: 'date' },
            { name: 'inspector', label: 'Inspector Name', type: 'text' },
            { name: 'area', label: 'Area Inspected', type: 'text' }
          ]
        }
      ]
    }
  };

  const actionItems = [
    { id: 1, title: 'Blocked drain in Processing Line 4', priority: 'High', dueDate: '2026-02-12', status: 'Open' },
    { id: 2, title: 'Replace worn safety mat at dock entrance', priority: 'Medium', dueDate: '2026-02-15', status: 'In Progress' },
    { id: 3, title: 'Fix loose guardrail near blast freezer', priority: 'High', dueDate: '2026-02-11', status: 'Open' }
  ];

  // Redirect Admin/SuperAdmin away from the user dashboard
  useEffect(() => {
    if (user && ['Admin', 'SuperAdmin'].includes(user.role)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Load company logo on component mount
  useEffect(() => {
    loadCompanyLogo();
    loadDashboardData();

    // Refresh dashboard every 30 seconds to stay in sync with database
    const refreshInterval = setInterval(() => {
      console.log('[DASHBOARD] 🔄 Auto-refreshing dashboard (30s interval)');
      loadDashboardData();
    }, 30000);

    // Refresh when tab regains focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[DASHBOARD] 👀 Tab regained focus - refreshing dashboard');
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load dashboard statistics from backend
  const loadDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setDashboardData({
            inspectionsThisWeek: data.data.inspectionsThisWeek || 0,
            pendingActionItems: data.data.pendingActionItems || 0,
            reportsThisMonth: data.data.reportsThisMonth || 0,
            recentActivity: data.data.recentActivity || []
          });
          console.log('[DASHBOARD] ✅ Data loaded from server successfully', data.data);
        }
      } else {
        console.warn('[DASHBOARD] Server returned status:', response.status);
      }
    } catch (error) {
      console.warn('[DASHBOARD] ⚠️ Error loading dashboard data:', error.message);
      // Keep default values if API fails
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Company Logo Handlers
  const loadCompanyLogo = async () => {
    try {
      const response = await fetch('/api/logo', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.logo) {
          setCompanyLogo(data.data.logo);
          console.log('[LOGO] Company logo loaded successfully');
        }
      }
    } catch (error) {
      console.warn('[LOGO] No company logo found or error loading:', error.message);
    }
  };

  const handleLogoFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Logo = e.target?.result;

        try {
          const response = await fetch('/api/logo/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              logoBase64: base64Logo
            })
          });

          if (response.ok) {
            setCompanyLogo(base64Logo);
            setLogoViewModel(false);
            setUploadingLogo(false);
            alert('Company logo uploaded successfully!');
            console.log('[LOGO] Company logo uploaded');
          } else {
            throw new Error('Failed to upload logo');
          }
        } catch (error) {
          setUploadingLogo(false);
          alert('Error uploading logo: ' + error.message);
          console.error('[LOGO] Upload error:', error);
        }
      };

      reader.onerror = () => {
        setUploadingLogo(false);
        alert('Error reading file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingLogo(false);
      alert('Error processing logo: ' + error.message);
      console.error('[LOGO] Processing error:', error);
    }
  };

  const deleteCompanyLogo = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete the company logo?')) return;

    try {
      const response = await fetch('/api/logo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setCompanyLogo(null);
        setLogoViewModel(false);
        alert('Company logo deleted successfully!');
        console.log('[LOGO] Company logo deleted');
      } else {
        throw new Error('Failed to delete logo');
      }
    } catch (error) {
      alert('Error deleting logo: ' + error.message);
      console.error('[LOGO] Delete error:', error);
    }
  };

  // Camera and Photo Handlers
  const startCamera = async (fieldName) => {
    try {
      setCameraLoading(true);
      setVideoReady(false);

      // Detect if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log('[CAMERA] Device type:', isMobile ? 'Mobile' : 'Desktop');

      // Progressive camera constraints (try best quality first, then fallback)
      const constraints = {
        audio: false,
        video: {
          facingMode: isMobile ? 'environment' : 'user', // Back camera on mobile, front on desktop
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      };

      let stream;
      try {
        // Try with ideal constraints
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('[CAMERA] Stream acquired with ideal quality');
      } catch (err) {
        // Fallback to basic constraints if ideal fails
        console.warn('[CAMERA] Ideal quality failed, trying basic:', err.message);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true // Just request any camera
        });
        console.log('[CAMERA] Stream acquired with basic quality');
      }

      setCameraActive(fieldName);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true; // Critical for iOS Safari
        videoRef.current.setAttribute('playsinline', ''); // iOS Safari fallback

        let readyCheckCount = 0;
        const maxReadyChecks = 50; // Check for 5 seconds (50 * 100ms)

        // ✅ ROBUST VIDEO READY DETECTION - Works on all devices
        const handleVideoReady = () => {
          readyCheckCount++;

          // Check if video has actual dimensions
          if (videoRef.current &&
              videoRef.current.videoWidth > 0 &&
              videoRef.current.videoHeight > 0 &&
              videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or better

            console.log('[CAMERA] ✅ Video ready:', {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
              readyState: videoRef.current.readyState,
              device: isMobile ? 'Mobile' : 'Desktop'
            });

            setVideoReady(true);
            setCameraLoading(false);

            // Clear timeout
            if (videoRef.current._cameraTimeout) {
              clearTimeout(videoRef.current._cameraTimeout);
            }
          } else if (readyCheckCount < maxReadyChecks) {
            // Keep checking every 100ms
            setTimeout(handleVideoReady, 100);
          } else {
            // Give up after max checks
            console.warn('[CAMERA] ⚠️ Video dimensions not ready after max checks, forcing ready');
            setVideoReady(true);
            setCameraLoading(false);
          }
        };

        // Listen to multiple events for maximum compatibility
        const onLoadedMetadata = () => {
          console.log('[CAMERA] 📊 Metadata loaded');
          requestAnimationFrame(handleVideoReady);
        };

        const onCanPlay = () => {
          console.log('[CAMERA] ▶️ Can play');
          requestAnimationFrame(handleVideoReady);
        };

        const onLoadedData = () => {
          console.log('[CAMERA] 📦 Data loaded');
          requestAnimationFrame(handleVideoReady);
        };

        // Attach multiple event listeners for robustness
        videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        videoRef.current.addEventListener('canplay', onCanPlay, { once: true });
        videoRef.current.addEventListener('loadeddata', onLoadedData, { once: true });

        // Start playing - crucial for iOS
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('[CAMERA] ▶️ Video playing');
          }
        } catch (playError) {
          console.warn('[CAMERA] ⚠️ Autoplay issue (may need user interaction):', playError.message);
          // On iOS, sometimes autoplay is blocked, but stream still works
          // Try to detect ready state anyway
          setTimeout(handleVideoReady, 500);
        }

        // Ultimate fallback timeout (15 seconds for slow devices/networks)
        const timeoutId = setTimeout(() => {
          if (!videoReady) {
            console.warn('[CAMERA] ⏰ Timeout reached (15s), forcing ready state');
            setVideoReady(true);
            setCameraLoading(false);
          }
        }, 15000);

        videoRef.current._cameraTimeout = timeoutId;

        // Start checking immediately
        setTimeout(handleVideoReady, 100);
      }
    } catch (error) {
      setCameraLoading(false);
      setVideoReady(false);
      setCameraActive(null);

      console.error('[CAMERA] ❌ Access error:', error);

      // Device-specific error messages
      let errorMessage = 'Error accessing camera: ' + error.message;

      if (error.name === 'NotAllowedError') {
        errorMessage = '📷 Camera permission denied.\n\n' +
          'Please:\n' +
          '1. Check browser settings\n' +
          '2. Allow camera access\n' +
          '3. Reload the page\n\n' +
          (navigator.userAgent.includes('iPhone') ?
            'iOS: Settings → Safari → Camera' :
            'Desktop: Click the camera icon in address bar');
      } else if (error.name === 'NotFoundError') {
        errorMessage = '📷 No camera found on this device.\n\n' +
          'Please check that:\n' +
          '- Your device has a camera\n' +
          '- Camera is not physically blocked\n' +
          '- Camera drivers are installed (desktop)';
      } else if (error.name === 'NotReadableError') {
        errorMessage = '📷 Camera is already in use.\n\n' +
          'Please close other apps/tabs using the camera:\n' +
          '- Other browser tabs\n' +
          '- Video conferencing apps (Zoom, Teams)\n' +
          '- Other camera apps';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '📷 Camera constraints not supported.\n\n' +
          'Your camera doesn\'t support the requested quality.\n' +
          'This shouldn\'t happen - please report this issue.';
      } else if (error.name === 'SecurityError') {
        errorMessage = '🔒 Security error: Camera access blocked.\n\n' +
          'This page must be served over HTTPS or localhost.\n' +
          'Please check the URL.';
      }

      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    // Clear any pending timeout
    if (videoRef.current?._cameraTimeout) {
      clearTimeout(videoRef.current._cameraTimeout);
    }
    
    // Stop all tracks
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Clear any pending timeout
    if (videoRef.current?._cameraTimeout) {
      clearTimeout(videoRef.current._cameraTimeout);
    }
    
    setCameraActive(null);
    setVideoReady(false);
    setCameraLoading(false);
  };

  const capturePhoto = async (fieldName) => {
    try {
      if (!videoReady) {
        alert('Camera is still initializing. Please wait a moment and try again.');
        return;
      }

      if (!canvasRef.current || !videoRef.current) {
        alert('Camera not ready. Please try again.');
        return;
      }

      // Double-check video dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        alert('Video frame not established. Please try again.');
        return;
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) {
        alert('Failed to access canvas. Please try again.');
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(
        blob => {
          if (blob && blob instanceof Blob) {
            try {
              // Convert blob to base64 data URL (so it works on server)
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64Url = e.target.result;
                addPhoto(fieldName, base64Url, blob);
                stopCamera();
              };
              reader.onerror = (error) => {
                console.error('Error converting photo to base64:', error);
                alert('Failed to process photo: ' + error.message);
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Error processing photo:', error);
              alert('Failed to process photo: ' + error.message);
            }
          } else {
            alert('Failed to create photo blob. Please try again.');
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('Photo capture error:', error);
      alert('Error capturing photo: ' + error.message);
    }
  };

  const handleFileUpload = (e, fieldName) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }

      Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
          alert(`File ${index + 1} is not an image. Please select image files only.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            if (event.target?.result) {
              addPhoto(fieldName, event.target.result, file);
            }
          } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing image: ' + error.message);
          }
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          alert('Error reading file');
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error uploading file: ' + error.message);
    }
  };

  const addPhoto = (fieldName, photoUrl, photoBlob) => {
    try {
      if (!photoUrl || !fieldName) {
        console.error('Missing required parameters for addPhoto');
        return;
      }

      setPhotos(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), { url: photoUrl, blob: photoBlob, caption: '' }]
      }));
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Error adding photo: ' + error.message);
    }
  };

  const removePhoto = (fieldName, index) => {
    setPhotos(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const updatePhotoCaption = (fieldName, index, caption) => {
    setPhotos(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((photo, i) => 
        i === index ? { ...photo, caption } : photo
      )
    }));
  };

  const submitFormData = async (evt) => {
    try {
      if (!selectedForm) {
        alert('No form selected. Please select a form to submit.');
        return;
      }

      // Validate form has at least some data
      if (Object.keys(formValues).length === 0) {
        alert('Please fill in at least some form fields before submitting.');
        return;
      }

      // Show loading indicator
      const submitButton = evt?.currentTarget;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '⏳ Submitting...';
      }

      // Prepare form data for submission
      const formType = selectedForm;
      const photosArray = [];

      // Convert photos to data format for API
      Object.entries(photos).forEach(([fieldName, photoList]) => {
        photoList.forEach((photo, index) => {
          photosArray.push({
            fieldName,
            index,
            url: photo.url,
            caption: photo.caption || 'Photo'
          });
        });
      });

      // Submit form to backend
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          formType,
          formData: formValues,
          photos: photosArray
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit form');
      }

      const result = await response.json();
      const formId = result.data.formId;

      // Show success notification
      setSuccessNotification({
        type: 'success',
        title: '✅ Form Submitted Successfully!',
        message: `Your form (ID: ${formId}) has been saved to the database. Generating PDF...`,
        formId: formId
      });

      // Download PDF with form type for better naming
      downloadFormPDF(formId, formType);

      // Refresh dashboard data after successful submission (so Recent Activity updates immediately)
      setTimeout(() => {
        console.log('[DASHBOARD] 🔄 Refreshing dashboard after form submission...');
        loadDashboardData();
      }, 1500);

      // Reset form after a short delay
      setTimeout(() => {
        setFormValues({});
        setPhotos({});
        setSelectedForm(null);
      }, 2000);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Complete & Generate PDF';
      }

    } catch (error) {
      console.error('Form submission error:', error);
      alert('Error submitting form: ' + error.message);
      
      if (evt?.currentTarget) {
        evt.currentTarget.disabled = false;
        evt.currentTarget.textContent = 'Complete & Generate PDF';
      }
    }
  };

  const downloadFormPDF = async (formId, formType) => {
    try {
      console.log(`[PDF] Starting PDF download for formId: ${formId}, type: ${formType}`);
      
      // Map frontend form type IDs to backend route names
      const formTypeToRoute = {
        'jsa': 'jsa',
        'loto': 'loto',
        'injury': 'injury',
        'accident': 'accident',
        'spillReport': 'spill',
        'monthlyInspection': 'inspection'
      };
      
      // Map form types to professional document names
      const formTypeNames = {
        'jsa': 'Job_Safety_Analysis',
        'loto': 'Lockout_Tagout_Procedure',
        'injury': 'Injury_Illness_Report',
        'accident': 'Accident_Report',
        'spillReport': 'Emergency_Spill_Release_Report',
        'monthlyInspection': 'Monthly_Hygiene_Inspection'
      };
      
      // Get the correct backend route for this form type
      const backendRoute = formTypeToRoute[formType] || formType;
      console.log(`[PDF] Using backend route: ${backendRoute}`);
      
      const response = await fetch(`/api/${backendRoute}/${formId}/export-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log(`[PDF] Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PDF] Error response:`, errorText);
        throw new Error(`Server returned status ${response.status}`);
      }

      // Convert response to blob
      const blob = await response.blob();
      console.log(`[PDF] Blob created, size: ${blob.size} bytes, type: ${blob.type}`);
      
      if (blob.size === 0) {
        throw new Error('PDF generated but is empty');
      }

      const url = URL.createObjectURL(blob);
      console.log(`[PDF] ObjectURL created`);

      // Generate professional document name
      const docName = formTypeNames[formType] || 'Safety_Form';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `${docName}_${formId}_${timestamp}.pdf`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      console.log(`[PDF] Triggering download for file: ${fileName}`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after download completes
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`[PDF] Download completed and cleanup done`);
      }, 100);
      
    } catch (error) {
      console.error('[PDF] Download error:', error);
      // Update notification to show download failure but form was saved
      setSuccessNotification({
        type: 'warning',
        title: '⚠️ Form Saved But PDF Download Failed',
        message: `Your form (ID: ${formId}) has been saved successfully, but PDF download failed. You can download it manually from the dashboard later.`,
        formId: formId
      });
    }
  };

  // Map DB form_type values to FORM_REGISTRY keys
  const dbTypeToRegistryKey = {
    jsa: 'jsa',
    loto: 'loto',
    injury: 'injury',
    accident: 'accident',
    spill: 'spillReport',
    inspection: 'monthlyInspection',
  };

  const reviseForm = async (formId, formType) => {
    console.log(`[REVISION] Starting revision for formId: ${formId}, type: ${formType}`);

    // Map DB type to registry key so FORM_REGISTRY lookup succeeds
    const registryKey = dbTypeToRegistryKey[formType] || formType;

    try {
      // Load the saved form data from the API
      const response = await fetch(`/api/forms/${formId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const json = await response.json();
      const savedFormData = json.success ? json.data.formData : {};

      setRevisionMode(true);
      setRevisionData({ formId, formType: registryKey, data: savedFormData });
      setSelectedForm(registryKey);
      setActiveView('new-assessment');
    } catch (err) {
      console.error('[REVISION] Failed to load form data:', err);
      setRevisionMode(true);
      setRevisionData({ formId, formType: registryKey, data: {} });
      setSelectedForm(registryKey);
      setActiveView('new-assessment');
    }
  };

  const isSupervisor = user?.role === 'Supervisor';

  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="welcome-header">
        <div>
          <h1>
            {isSupervisor
              ? `Team Safety Overview`
              : `My Safety Dashboard`}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {isSupervisor
              ? `Reviewing your team's activity and open items`
              : `Your personal safety activity and tasks`}
          </p>
        </div>
        <p className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Role badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: isSupervisor ? '#fef3c7' : '#eff6ff',
        color: isSupervisor ? '#92400e' : '#1e40af',
        borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700,
        marginBottom: 20,
      }}>
        {isSupervisor ? <Users size={13} /> : <User size={13} />}
        {isSupervisor ? 'Supervisor View — Team Data' : 'Employee View — Personal Data'}
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-green">
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <h3>{loadingDashboard ? '-' : dashboardData.inspectionsThisWeek}</h3>
            <p>{isSupervisor ? 'Team Inspections This Week' : 'Inspections This Week'}</p>
          </div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-icon">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <h3>{loadingDashboard ? '-' : dashboardData.pendingActionItems}</h3>
            <p>{isSupervisor ? 'Open Team Actions' : 'My Pending Actions'}</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <FileText size={32} />
          </div>
          <div className="stat-content">
            <h3>{loadingDashboard ? '-' : dashboardData.reportsThisMonth}</h3>
            <p>{isSupervisor ? 'Team Reports This Month' : 'My Reports This Month'}</p>
          </div>
        </div>
      </div>

      {/* Quick actions for Supervisor */}
      {isSupervisor && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ marginBottom: 14, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Team Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'New Inspection', view: 'new-assessment', color: '#0d9488' },
              { label: 'Log Action Item', view: 'action-items', color: '#ea580c' },
              { label: 'Training Records', view: 'training', color: '#7c3aed' },
            ].map(({ label, view, color }) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                style={{
                  background: color, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions for User */}
      {!isSupervisor && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ marginBottom: 14, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Submit New Form', view: 'new-assessment', color: '#2563eb' },
              { label: 'My Action Items', view: 'action-items', color: '#ea580c' },
            ].map(({ label, view, color }) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                style={{
                  background: color, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="recent-activity">
        <h2>Recent Activity & Downloads</h2>
        <div className="activity-list">
          {loadingDashboard ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Loading activity...
            </div>
          ) : dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div className="activity-icon" style={{ fontSize: '20px', flexShrink: 0 }}>{activity.icon || '📋'}</div>
                  <div className="activity-details" style={{ minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{activity.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{activity.description || activity.timestamp}</p>
                  </div>
                </div>
                {activity.id && activity.formType && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="download-report-btn"
                      onClick={() => downloadFormPDF(activity.id, activity.formType)}
                      title="Download PDF Report"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '8px 14px', 
                        backgroundColor: '#10b981', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        transition: 'background-color 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      <Download size={16} /> Download
                    </button>
                    <button
                      className="revise-form-btn"
                      onClick={() => reviseForm(activity.id, activity.formType)}
                      title="Revise or Edit this Form"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '8px 14px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        transition: 'background-color 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      <Edit3 size={16} /> Revise
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No recent activity. Submit a form to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNewAssessment = () => (
    <div className="assessment-container">
      <h1>New Assessment</h1>
      <p className="subtitle">Select a form type to begin</p>
      
      <div className="form-selection-grid">
        {Object.entries(FORM_REGISTRY).map(([key, formConfig]) => {
          const IconComponent = formConfig.icon;
          return (
            <div
              key={key}
              className="form-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedForm(key)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedForm(key)}
            >
              <div className="form-card-icon">
                <IconComponent size={40} />
              </div>
              <h3>{formConfig.name}</h3>
              <p>{formConfig.sections} sections</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFormBuilder = () => {
    if (!selectedForm || !FORM_REGISTRY[selectedForm]) {
      return renderNewAssessment();
    }

    const formConfig = FORM_REGISTRY[selectedForm];
    const FormComponent = formConfig.component;

    // Handle successful form submission
    const handleFormSuccess = async (response) => {
      const formId = response.id || response.formId;
      
      // Show success notification
      setSuccessNotification({
        type: 'success',
        title: '✅ Form Submitted Successfully!',
        message: `Your ${formConfig.name} has been saved (ID: ${formId})${revisionMode ? ' with revisions' : ''}`,
        formId: formId
      });

      // Download PDF automatically after a short delay
      setTimeout(() => {
        downloadFormPDF(formId, selectedForm);
      }, 500);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedForm(null);
        setSuccessNotification(null);
        
        // Clear revision mode after successful submission
        if (revisionMode) {
          setRevisionMode(false);
          setRevisionData(null);
        }
      }, 2000);
    };

    // Handle form cancellation
    const handleFormCancel = () => {
      setSelectedForm(null);
      setSuccessNotification(null);
      
      // Clear revision mode on cancel
      if (revisionMode) {
        setRevisionMode(false);
        setRevisionData(null);
      }
    };
    
    return (
      <div className="form-builder-container">
        <div className="form-header">
          <button className="back-button" onClick={handleFormCancel}>
            ← Back
          </button>
          <h1>{formConfig.name}</h1>
        </div>

        {/* Success Notification */}
        {successNotification && (
          <div className="success-notification">
            <div className="notification-content">
              <h3>{successNotification.title}</h3>
              <p>{successNotification.message}</p>
              <div className="notification-spinner">
                <div className="spinner" />
                <p>Generating PDF...</p>
              </div>
            </div>
          </div>
        )}

        {/* Render the actual form component from FormRegistry */}
        <div className="form-component-wrapper">
          <FormComponent
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            formId={revisionMode ? revisionData?.formId : null}
            initialData={revisionMode ? revisionData?.data : null}
          />
        </div>

        <style jsx>{`
          .success-notification {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
          }

          .notification-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .notification-content h3 {
            font-size: 24px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 12px;
          }

          .notification-content p {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 24px;
          }

          .notification-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .notification-spinner p {
            margin: 0;
            font-size: 14px;
            color: #94a3b8;
          }
        `}</style>
      </div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const renderOldTemplateForm = () => {
    const template = {}; // placeholder
    return (
      <div style={{display: 'none'}}>
        <div className="form-sections">
          {template.sections && template.sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="form-section">
              <h2>{section.title}</h2>
              
              {section.repeatable && (
                <button className="add-row-button">+ Add Another {section.title}</button>
              )}

              <div className="form-fields">
                {section.fields.map((field, fieldIdx) => (
                  <div key={fieldIdx} className="form-field">
                    <label>{field.label}</label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    {field.type === 'email' && (
                      <input
                        type="email"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                        placeholder="email@example.com"
                      />
                    )}
                    {field.type === 'tel' && (
                      <input
                        type="tel"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                        placeholder="(123) 456-7890"
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                      />
                    )}
                    {field.type === 'time' && (
                      <input
                        type="time"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                      />
                    )}
                    {field.type === 'datetime-local' && (
                      <input
                        type="datetime-local"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        rows="4"
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [field.name]: e.target.value})}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'multiselect' && (
                      <div className="multiselect-container">
                        <div
                          className={`multiselect-trigger ${openDropdown === field.name ? 'open' : ''}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setOpenDropdown(openDropdown === field.name ? null : field.name)}
                          onKeyDown={(e) => e.key === 'Enter' && setOpenDropdown(openDropdown === field.name ? null : field.name)}
                        >
                          <div className="selected-tags">
                            {(formValues[field.name] || []).map((item, i) => (
                              <span key={i} className="tag">
                                {item} 
                                <button 
                                  type="button"
                                  className="tag-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormValues({
                                      ...formValues,
                                      [field.name]: (formValues[field.name] || []).filter(x => x !== item)
                                    });
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {(!formValues[field.name] || formValues[field.name].length === 0) && (
                              <span className="placeholder">Select items...</span>
                            )}
                          </div>
                          <div className="dropdown-arrow">▼</div>
                        </div>
                        
                        {openDropdown === field.name && (
                          <div className="multiselect-dropdown">
                            {field.options?.map((opt, i) => (
                              <label key={i} className="multiselect-option">
                                <input 
                                  type="checkbox" 
                                  checked={(formValues[field.name] || []).includes(opt)}
                                  onChange={(e) => {
                                    const selected = formValues[field.name] || [];
                                    if (e.target.checked) {
                                      setFormValues({
                                        ...formValues,
                                        [field.name]: [...selected, opt]
                                      });
                                    } else {
                                      setFormValues({
                                        ...formValues,
                                        [field.name]: selected.filter(x => x !== opt)
                                      });
                                    }
                                  }}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {field.type === 'camera' && (
                      <div className="camera-field">
                        {cameraActive !== field.name ? (
                          <>
                            <div className="camera-controls">
                              <button 
                                className="camera-button"
                                onClick={() => startCamera(field.name)}
                              >
                                <Camera size={24} />
                                <span>Take Photo</span>
                              </button>
                              <button 
                                className="camera-button upload-button"
                                onClick={() => {
                                  if (!fileInputRef.current[field.name]) {
                                    fileInputRef.current[field.name] = {};
                                  }
                                  fileInputRef.current[field.name].click?.();
                                }}
                              >
                                <Upload size={24} />
                                <span>Upload Photo</span>
                              </button>
                              <input 
                                type="file" 
                                ref={(ref) => { if (ref) fileInputRef.current[field.name] = ref; }}
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, field.name)}
                              />
                            </div>

                            {photos[field.name]?.length > 0 && (
                              <div className="photos-gallery">
                                <h4>Photos ({photos[field.name].length})</h4>
                                <div className="gallery-grid">
                                  {photos[field.name].map((photo, i) => (
                                    <div key={i} className="photo-preview">
                                      <img src={photo.url} alt={`Preview ${i + 1}`} />
                                      <input 
                                        type="text" 
                                        placeholder="Add caption..."
                                        value={photo.caption}
                                        onChange={(e) => updatePhotoCaption(field.name, i, e.target.value)}
                                        className="photo-caption"
                                      />
                                      <button 
                                        className="delete-photo"
                                        onClick={() => removePhoto(field.name, i)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="camera-stream">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline
                              muted
                              className="camera-video"
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            
                            {cameraLoading && (
                              <div className="camera-loading-overlay">
                                <div className="loading-spinner" />
                                <p>📷 Initializing camera... Please wait</p>
                                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                                  {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                                    ? '📱 Mobile device detected - Allow camera access when prompted'
                                    : '💻 Desktop detected - Allow camera access when prompted'
                                  }
                                </p>
                                <button 
                                  className="retry-button"
                                  onClick={() => {
                                    stopCamera();
                                    setTimeout(() => startCamera(field.name), 500);
                                  }}
                                >
                                  Retry
                                </button>
                              </div>
                            )}
                            
                            <div className="camera-actions">
                              <button 
                                className="capture-button"
                                onClick={() => capturePhoto(field.name)}
                                disabled={cameraLoading || !videoReady}
                                title={cameraLoading ? 'Camera is initializing...' : !videoReady ? 'Waiting for camera to be ready...' : 'Click to capture photo'}
                              >
                                {cameraLoading ? '⏳ Initializing...' : videoReady ? '📸 Capture' : '⏳ Loading...'}
                              </button>
                              <button 
                                className="cancel-button"
                                onClick={stopCamera}
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="button-secondary">Save Draft</button>
          <button className="button-primary" onClick={submitFormData}>Complete & Generate PDF</button>
        </div>
      </div>
    );
  };

  const renderActionItems = () => (
    <div className="action-items-container">
      <div className="page-header">
        <h1>Action Items</h1>
        <button className="button-primary">+ New Action Item</button>
      </div>

      <div className="action-items-list">
        {actionItems.map(item => (
          <div key={item.id} className={`action-item priority-${item.priority.toLowerCase()}`}>
            <div className="action-item-header">
              <h3>{item.title}</h3>
              <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div className="action-item-meta">
              <span className="priority-badge">{item.priority} Priority</span>
              <span className="due-date">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="action-item-actions">
              <button className="button-small">Update</button>
              <button className="button-small">Complete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrainingToolbox = () => (
    <div className="training-container">
      <h1>Training & Toolbox Talks</h1>
      
      <div className="training-grid">
        <div className="training-card">
          <h3>🧊 Cold Storage Safety</h3>
          <p>Hypothermia prevention and proper PPE</p>
          <button className="button-primary">Start Session</button>
        </div>
        <div className="training-card">
          <h3>🔪 Knife Safety</h3>
          <p>Proper handling and cut prevention</p>
          <button className="button-primary">Start Session</button>
        </div>
        <div className="training-card">
          <h3>⚡ LOTO Procedures</h3>
          <p>Lockout/Tagout training</p>
          <button className="button-primary">Start Session</button>
        </div>
        <div className="training-card">
          <h3>🧪 Chemical Handling</h3>
          <p>Safe handling of cleaning chemicals</p>
          <button className="button-primary">Start Session</button>
        </div>
      </div>
    </div>
  );

  const renderSDSLibrary = () => (
    <div className="sds-container">
      <div className="page-header">
        <h1>SDS Library</h1>
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Search chemicals..." />
        </div>
      </div>

      <div className="sds-grid">
        <div className="sds-card">
          <div className="sds-icon">🧪</div>
          <h3>Ammonia (Anhydrous)</h3>
          <p>Last updated: Jan 2026</p>
          <button className="button-primary">View PDF</button>
        </div>
        <div className="sds-card">
          <div className="sds-icon">💧</div>
          <h3>Sodium Hypochlorite</h3>
          <p>Last updated: Dec 2025</p>
          <button className="button-primary">View PDF</button>
        </div>
        <div className="sds-card">
          <div className="sds-icon">🧼</div>
          <h3>Quaternary Ammonium</h3>
          <p>Last updated: Jan 2026</p>
          <button className="button-primary">View PDF</button>
        </div>
        <div className="sds-card">
          <div className="sds-icon">⚗️</div>
          <h3>Peracetic Acid</h3>
          <p>Last updated: Nov 2025</p>
          <button className="button-primary">View PDF</button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h1>Sync & Settings</h1>
      
      <div className="settings-section">
        <h2>Company Branding</h2>
        <div className="logo-settings">
          {companyLogo ? (
            <div className="logo-preview">
              <img src={companyLogo} alt="Company Logo" style={{ maxWidth: '200px', maxHeight: '100px' }} />
              <p className="logo-status">✓ Logo uploaded</p>
            </div>
          ) : (
            <div className="no-logo">
              <p>No company logo uploaded</p>
            </div>
          )}
          <div className="logo-buttons">
            <button 
              className="button-primary"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
            >
              <Upload size={20} />
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </button>
            {companyLogo && (
              <button 
                className="button-secondary"
                onClick={deleteCompanyLogo}
                disabled={uploadingLogo}
              >
                Delete Logo
              </button>
            )}
          </div>
          <p className="logo-help">Logo will appear at the top of generated PDFs. Maximum 2MB, PNG/JPG recommended.</p>
          <input 
            ref={logoInputRef}
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }}
            onChange={handleLogoFileSelect}
          />
        </div>
      </div>

      <div className="settings-section">
        <h2>SharePoint Sync</h2>
        <div className="sync-status">
          <div className="sync-indicator online">●</div>
          <div>
            <h4>Connected</h4>
            <p>Last synced: 5 minutes ago</p>
          </div>
        </div>
        <button className="button-primary">
          <Upload size={20} />
          Sync Now
        </button>
      </div>

      <div className="settings-section">
        <h2>Local Storage</h2>
        <p>47 documents stored locally</p>
        <button className="button-secondary">Manage Storage</button>
      </div>
    </div>
  );

  return (
    <div className="seafood-safety-app">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="app-logo">
          <Shield size={32} />
          <h1>Safety Manager</h1>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveView('dashboard'); setSelectedForm(null); }}
          >
            <FileText size={20} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeView === 'new-assessment' ? 'active' : ''}`}
            onClick={() => { setActiveView('new-assessment'); setSelectedForm(null); }}
          >
            <CheckCircle size={20} />
            <span>New Assessment</span>
          </button>
          
          <button 
            className={`nav-item ${activeView === 'action-items' ? 'active' : ''}`}
            onClick={() => { setActiveView('action-items'); setSelectedForm(null); }}
          >
            <AlertTriangle size={20} />
            <span>Action Items</span>
          </button>
          
          <button 
            className={`nav-item ${activeView === 'training' ? 'active' : ''}`}
            onClick={() => { setActiveView('training'); setSelectedForm(null); }}
          >
            <Users size={20} />
            <span>Training</span>
          </button>
          
          <button 
            className={`nav-item ${activeView === 'sds' ? 'active' : ''}`}
            onClick={() => { setActiveView('sds'); setSelectedForm(null); }}
          >
            <BookOpen size={20} />
            <span>SDS Library</span>
          </button>
          
          <button 
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveView('settings'); setSelectedForm(null); }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {['Admin', 'SuperAdmin'].includes(user?.role) && (
            <a
              href="/admin"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'rgba(37,99,235,0.15)', borderRadius: 6, marginBottom: 10,
                color: '#93c5fd', textDecoration: 'none', fontSize: 12.5, fontWeight: 600,
              }}
            >
              <ShieldCheck size={15} />
              EHS Command Center
            </a>
          )}
          <div className="user-info" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <User size={24} />
              <div>
                <h4>{user?.full_name || user?.username || 'User'}</h4>
                <p>{user?.role || 'Safety Manager'}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'new-assessment' && (selectedForm ? renderFormBuilder() : renderNewAssessment())}
        {activeView === 'action-items' && renderActionItems()}
        {activeView === 'training' && renderTrainingToolbox()}
        {activeView === 'sds' && renderSDSLibrary()}
        {activeView === 'settings' && renderSettings()}
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .seafood-safety-app {
          display: flex;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f8fafc;
          overflow: hidden;
        }

        .sidebar {
          width: 260px;
          min-width: 260px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
          position: relative;
          z-index: 100;
          overflow-y: auto;
        }

        .app-logo {
          padding: 32px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .app-logo h1 {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
        }

        .nav-menu {
          flex: 1;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 15px;
          font-weight: 500;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.2);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info h4 {
          font-size: 14px;
          font-weight: 600;
        }

        .user-info p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 40px;
          padding-right: 56px;
          min-height: 0;
          scrollbar-gutter: stable;
          box-sizing: border-box;
        }

        .welcome-header {
          margin-bottom: 32px;
        }

        .welcome-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .date-display {
          font-size: 16px;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 20px;
          border-left: 4px solid;
        }

        .stat-green {
          border-left-color: #10b981;
        }

        .stat-yellow {
          border-left-color: #f59e0b;
        }

        .stat-blue {
          border-left-color: #3b82f6;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 12px;
        }

        .stat-green .stat-icon {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #10b981;
        }

        .stat-yellow .stat-icon {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          color: #f59e0b;
        }

        .stat-blue .stat-icon {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
        }

        .stat-content h3 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-content p {
          font-size: 14px;
          color: #64748b;
        }

        .recent-activity {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .recent-activity h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          background: #f8fafc;
          transition: transform 0.2s ease;
        }

        .activity-item:hover {
          transform: translateX(4px);
          background: #f1f5f9;
        }

        .activity-details {
          flex: 1;
        }

        .download-report-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: #1e40af;
          color: white;
          cursor: pointer;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }

        .download-report-btn:hover {
          background: #1e3a8a;
        }

        .activity-icon {
          font-size: 28px;
        }

        .activity-details h4 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .activity-details p {
          font-size: 13px;
          color: #64748b;
        }

        .assessment-container h1 {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 32px;
        }

        .form-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .form-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          text-align: center;
        }

        .form-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .form-card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
          margin-bottom: 20px;
        }

        .form-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .form-card p {
          font-size: 14px;
          color: #64748b;
        }

        .form-builder-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .back-button {
          padding: 10px 20px;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          transition: background 0.2s ease;
        }

        .back-button:hover {
          background: #e2e8f0;
        }

        .form-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
        }

        .form-progress {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .form-progress p {
          font-size: 13px;
          color: #64748b;
        }

        .form-section {
          background: white;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .form-section h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f5f9;
        }

        .form-fields {
          display: grid;
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          color: #0f172a;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .multiselect {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .multiselect-container {
          position: relative;
        }

        .multiselect-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 50px;
        }

        .multiselect-trigger:hover {
          border-color: #cbd5e1;
        }

        .multiselect-trigger:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          flex: 1;
          align-items: center;
        }

        .placeholder {
          color: #94a3b8;
          font-size: 15px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .tag-remove {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: transform 0.15s ease;
        }

        .tag-remove:hover {
          transform: scale(1.2);
        }

        .dropdown-arrow {
          color: #94a3b8;
          font-size: 12px;
          margin-left: 8px;
          transition: transform 0.2s ease;
        }

        .multiselect-trigger.open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .multiselect-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          max-height: 320px;
          overflow-y: auto;
          z-index: 1000;
        }

        .multiselect-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s ease;
          border-bottom: 1px solid #f1f5f9;
        }

        .multiselect-option:last-child {
          border-bottom: none;
        }

        .multiselect-option:hover {
          background: #f0f9ff;
        }

        .multiselect-option input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .multiselect-option span {
          font-size: 15px;
          color: #0f172a;
          flex: 1;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag button {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .camera-field {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .camera-controls {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .camera-button,
        .upload-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .upload-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .camera-button:hover,
        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .camera-stream {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          background: #f1f5f9;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid #3b82f6;
          position: relative;
        }

        .camera-video {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
          max-height: 500px;
          background: #000;
        }

        .camera-actions {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.1);
          justify-content: center;
        }

        .capture-button,
        .cancel-button {
          padding: 12px 28px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .capture-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          flex: 1;
          max-width: 200px;
        }

        .capture-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .capture-button:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .capture-button:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
        }

        .camera-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 10;
          border-radius: 8px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .camera-loading-overlay p {
          color: white;
          font-size: 16px;
          font-weight: 500;
        }

        .retry-button {
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .cancel-button {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 12px 20px;
        }

        .cancel-button:hover {
          background: rgb(239, 68, 68);
          transform: scale(1.05);
        }

        .photos-gallery {
          width: 100%;
        }

        .photos-gallery h4 {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          width: 100%;
        }

        .photo-preview {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .photo-preview:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .photo-preview img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .photo-caption {
          width: 100%;
          padding: 8px 12px;
          border: none;
          border-top: 1px solid #e5e7eb;
          border-radius: 0;
          font-size: 13px;
          color: #334155;
        }

        .photo-caption::placeholder {
          color: #cbd5e1;
        }

        .photo-caption:focus {
          outline: none;
          background: #f0f9ff;
        }

        .delete-photo {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 36px;
          height: 36px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          line-height: 1;
        }

        .delete-photo:hover {
          background: rgb(239, 68, 68);
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }

          .main-content {
            padding: 24px;
          }

          .welcome-header h1 {
            font-size: 28px;
          }

          .form-section {
            padding: 20px;
          }

          .form-header h1 {
            font-size: 24px;
          }

          .camera-button {
            font-size: 14px;
            padding: 12px 16px;
          }

          .photo-preview img {
            max-height: 400px;
          }

          .form-selection-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .seafood-safety-app {
            flex-direction: column;
            height: auto;
          }

          .sidebar {
            width: 100%;
            flex-direction: row;
            max-height: 60px;
            overflow-x: auto;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          }

          .app-logo {
            padding: 12px 16px;
            border-bottom: none;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
          }

          .app-logo h1 {
            display: none;
          }

          .nav-menu {
            flex-direction: row;
            padding: 8px;
            gap: 4px;
            overflow-x: auto;
          }

          .nav-item {
            font-size: 13px;
            padding: 10px 12px;
            white-space: nowrap;
          }

          .nav-item span {
            display: none;
          }

          .sidebar-footer {
            display: none;
          }

          .main-content {
            padding: 16px;
            min-height: calc(100vh - 60px);
          }

          .welcome-header h1 {
            font-size: 24px;
            margin-bottom: 4px;
          }

          .date-display {
            font-size: 14px;
          }

          .form-section {
            padding: 16px;
          }

          .form-field input,
          .form-field select,
          .form-field textarea {
            font-size: 16px;
            padding: 12px;
          }

          .photo-preview img {
            max-height: 300px;
          }

          .camera-button {
            font-size: 13px;
          }

          .form-selection-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .form-card {
            padding: 20px;
          }

          .form-card-icon {
            width: 60px;
            height: 60px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 20px;
          }

          .stat-card {
            padding: 16px;
            gap: 12px;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
            flex-shrink: 0;
          }

          .stat-content h3 {
            font-size: 24px;
          }

          .training-grid {
            grid-template-columns: 1fr;
          }

          .sds-grid {
            grid-template-columns: 1fr;
          }

          .form-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .form-header h1 {
            font-size: 20px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .search-bar {
            width: 100%;
          }

          .delete-photo {
            width: 32px;
            height: 32px;
            font-size: 18px;
          }

          .camera-controls {
            flex-direction: column;
            gap: 8px;
          }

          .camera-button,
          .upload-button {
            padding: 12px 16px;
            font-size: 14px;
          }

          .camera-video {
            max-height: 300px;
          }

          .camera-actions {
            flex-direction: column;
            padding: 12px;
          }

          .capture-button,
          .cancel-button {
            width: 100%;
            max-width: none;
          }

          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
          }

          .photo-preview img {
            height: 150px;
          }
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 32px;
        }

        .button-primary {
          padding: 14px 28px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .button-secondary {
          padding: 14px 28px;
          background: white;
          color: #334155;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .button-small {
          padding: 8px 16px;
          background: #f1f5f9;
          color: #334155;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .button-small:hover {
          background: #e2e8f0;
        }

        .action-items-container,
        .training-container,
        .sds-container,
        .settings-container {
          max-width: 1000px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #0f172a;
        }

        .action-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-item {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-left: 4px solid;
        }

        .priority-high {
          border-left-color: #ef4444;
        }

        .priority-medium {
          border-left-color: #f59e0b;
        }

        .priority-low {
          border-left-color: #3b82f6;
        }

        .action-item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .action-item-header h3 {
          font-size: 17px;
          font-weight: 600;
          color: #0f172a;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-open {
          background: #fef3c7;
          color: #92400e;
        }

        .status-in-progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .action-item-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .priority-badge {
          padding: 4px 12px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .due-date {
          font-size: 13px;
          color: #64748b;
        }

        .action-item-actions {
          display: flex;
          gap: 12px;
        }

        .training-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .training-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .training-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .training-card p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          min-width: 300px;
        }

        .search-bar input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 15px;
        }

        .sds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .sds-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .sds-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .sds-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .sds-card p {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 16px;
        }

        .settings-section {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }

        .settings-section h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .sync-status {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .sync-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .sync-indicator.online {
          background: #10b981;
        }

        .sync-status h4 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .sync-status p {
          font-size: 13px;
          color: #64748b;
        }

        .logo-settings {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .logo-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
        }

        .logo-preview img {
          margin-bottom: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .logo-status {
          font-size: 14px;
          font-weight: 600;
          color: #10b981;
          margin: 0;
        }

        .no-logo {
          padding: 24px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
          text-align: center;
          color: #64748b;
        }

        .logo-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .logo-buttons button {
          flex: 1;
          min-width: 150px;
        }

        .logo-help {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default SeafoodSafetyManagerApp;
