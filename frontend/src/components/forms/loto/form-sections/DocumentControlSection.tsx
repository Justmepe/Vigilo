import { Dispatch, SetStateAction } from 'react';
import { LOTOData } from '../../App';
import { FileText } from 'lucide-react';

interface DocumentControlSectionProps {
  formData: LOTOData;
  setFormData: Dispatch<SetStateAction<LOTOData>>;
}

export function DocumentControlSection({ formData, setFormData }: DocumentControlSectionProps) {
  const handleChange = (field: keyof LOTOData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-red-600" />
        <h2 className="text-xl text-slate-900">Document Control</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label htmlFor="documentNumber" className="block text-sm text-slate-700 mb-2">
            Document Number <span className="text-red-600">*</span>
          </label>
          <input
            id="documentNumber"
            type="text"
            value={formData.documentNumber}
            onChange={(e) => handleChange('documentNumber', e.target.value)}
            placeholder="e.g., LOTO-001"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="revisionNumber" className="block text-sm text-slate-700 mb-2">
            Revision Number <span className="text-red-600">*</span>
          </label>
          <input
            id="revisionNumber"
            type="text"
            value={formData.revisionNumber}
            onChange={(e) => handleChange('revisionNumber', e.target.value)}
            placeholder="e.g., 1.0"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="effectiveDate" className="block text-sm text-slate-700 mb-2">
            Effective Date <span className="text-red-600">*</span>
          </label>
          <input
            id="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => handleChange('effectiveDate', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="reviewDate" className="block text-sm text-slate-700 mb-2">
            Next Review Date
          </label>
          <input
            id="reviewDate"
            type="date"
            value={formData.reviewDate}
            onChange={(e) => handleChange('reviewDate', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="preparedBy" className="block text-sm text-slate-700 mb-2">
            Prepared By
          </label>
          <input
            id="preparedBy"
            type="text"
            value={formData.preparedBy}
            onChange={(e) => handleChange('preparedBy', e.target.value)}
            placeholder="Name and Title"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="reviewedBy" className="block text-sm text-slate-700 mb-2">
            Reviewed By
          </label>
          <input
            id="reviewedBy"
            type="text"
            value={formData.reviewedBy}
            onChange={(e) => handleChange('reviewedBy', e.target.value)}
            placeholder="Name and Title"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="approvedBy" className="block text-sm text-slate-700 mb-2">
            Approved By
          </label>
          <input
            id="approvedBy"
            type="text"
            value={formData.approvedBy}
            onChange={(e) => handleChange('approvedBy', e.target.value)}
            placeholder="Name and Title"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
