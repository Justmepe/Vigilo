import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../../App';
import { Upload, X } from 'lucide-react';

interface EquipmentInfoSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function EquipmentInfoSection({ formData, setFormData }: EquipmentInfoSectionProps) {
  const handleChange = (field: keyof LOTOData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, equipmentPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, equipmentPhoto: undefined }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl text-slate-900 mb-6">Equipment Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Info */}
        <div>
          <label htmlFor="equipmentName" className="block text-sm text-slate-700 mb-2">
            Equipment Name <span className="text-red-600">*</span>
          </label>
          <input
            id="equipmentName"
            type="text"
            value={formData.equipmentName}
            onChange={(e) => handleChange('equipmentName', e.target.value)}
            placeholder="e.g., Hydraulic Press #3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="equipmentID" className="block text-sm text-slate-700 mb-2">
            Equipment ID
          </label>
          <input
            id="equipmentID"
            type="text"
            value={formData.equipmentID}
            onChange={(e) => handleChange('equipmentID', e.target.value)}
            placeholder="e.g., HP-2024-003"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm text-slate-700 mb-2">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Building A, Bay 3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm text-slate-700 mb-2">
            Department
          </label>
          <input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="e.g., Production"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="manufacturer" className="block text-sm text-slate-700 mb-2">
            Manufacturer
          </label>
          <input
            id="manufacturer"
            type="text"
            value={formData.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            placeholder="e.g., Acme Manufacturing"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="modelNumber" className="block text-sm text-slate-700 mb-2">
            Model Number
          </label>
          <input
            id="modelNumber"
            type="text"
            value={formData.modelNumber}
            onChange={(e) => handleChange('modelNumber', e.target.value)}
            placeholder="e.g., HP-500X"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Purpose */}
      <div className="mt-6">
        <label htmlFor="purposeOfLockout" className="block text-sm text-slate-700 mb-2">
          Purpose of Lockout/Tagout <span className="text-red-600">*</span>
        </label>
        <textarea
          id="purposeOfLockout"
          value={formData.purposeOfLockout}
          onChange={(e) => handleChange('purposeOfLockout', e.target.value)}
          placeholder="Describe the activities that require LOTO (e.g., maintenance, repair, cleaning, installation)"
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Equipment Photo */}
      <div className="mt-6">
        <label className="block text-sm text-slate-700 mb-2">
          Equipment Photo (for Quick Reference Guide)
        </label>
        {!formData.equipmentPhoto ? (
          <div>
            <input
              id="equipmentPhoto"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label
              htmlFor="equipmentPhoto"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={formData.equipmentPhoto}
                alt="Equipment"
                className="max-w-xs h-auto rounded-lg border border-slate-300"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}