import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PhotoUpload } from './PhotoUpload';

interface InvestigationProps {
  data: any;
  onUpdate: (data: any) => void;
  firstReportData?: any;
}

export function Investigation({ data, onUpdate, firstReportData }: InvestigationProps) {
  const [formData, setFormData] = useState({
    originalDateOfHire: '',
    accidentScene: '',
    didBreakSafetyRule: '',
    breakSafetyRuleExplanation: '',
    investigatedBy: '',
    investigationDate: '',
    photos: [],
    ...data
  });

  // Update form data when firstReportData changes
  useEffect(() => {
    if (firstReportData && Object.keys(data).length === 0) {
      setFormData(prev => ({
        ...prev,
        originalDateOfHire: firstReportData.dateTimeOfIncident ? new Date(firstReportData.dateTimeOfIncident).toLocaleDateString() : '',
        accidentScene: '',
        didBreakSafetyRule: '',
        breakSafetyRuleExplanation: '',
        investigatedBy: firstReportData.reporterName || '',
        investigationDate: '',
        photos: [],
      }));
    }
  }, [firstReportData]);

  useEffect(() => {
    onUpdate(formData);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black text-white px-4 py-2 -mx-8 -mt-8 mb-6">
        <h2 className="text-white text-center">SUPERVISOR-Injury/Illness Report</h2>
      </div>

      {/* Section Header */}
      <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mb-6">
        <p className="text-sm text-amber-900">
          <strong>To be completed by Supervisor:</strong> Review the initial report details below, then complete the investigation-specific fields.
        </p>
      </div>

      {/* Read-Only Summary from First Report */}
      {firstReportData && (
        <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6 mb-6">
          <h3 className="uppercase text-xs mb-4 text-slate-700">First Report Summary (Read-Only)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Employee:</span>
              <p className="font-medium">{firstReportData.employeeName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Job Title:</span>
              <p className="font-medium">{firstReportData.jobTitle || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">UKG Employee Number:</span>
              <p className="font-medium">{firstReportData.ukgEmployeeNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Plant:</span>
              <p className="font-medium">{firstReportData.plant || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Date/Time of Incident:</span>
              <p className="font-medium">{firstReportData.dateTimeOfIncident ? new Date(firstReportData.dateTimeOfIncident).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Shift:</span>
              <p className="font-medium">{firstReportData.shift || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Location of Incident:</span>
              <p className="font-medium">{firstReportData.whereWereYou || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Nature of Injury:</span>
              <p className="font-medium">{firstReportData.natureOfInjury || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-600">Affected Body Part:</span>
              <p className="font-medium">
                {firstReportData.bodyPartInjured || 'N/A'}
                {firstReportData.bodyPartInjuredOther && ` (${firstReportData.bodyPartInjuredOther})`}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-600">Incident Description:</span>
              <p className="font-medium mt-1">{firstReportData.howDidIncidentHappen || 'N/A'}</p>
            </div>
            {(firstReportData.witness1Name || firstReportData.witness2Name || firstReportData.witness3Name) && (
              <div className="md:col-span-2">
                <span className="text-slate-600">Witnesses:</span>
                <p className="font-medium mt-1">
                  {[firstReportData.witness1Name, firstReportData.witness2Name, firstReportData.witness3Name]
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supervisor Investigation Fields - UNIQUE to this section */}
      <div className="border-t-2 border-black pt-6">
        <h3 className="uppercase text-sm mb-4 text-slate-900">Supervisor Investigation Details</h3>

        {/* Original Date of Hire */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="originalDateOfHire" className="uppercase text-xs">Original Date of Hire:</Label>
          <Input
            id="originalDateOfHire"
            type="date"
            value={formData.originalDateOfHire}
            onChange={(e) => handleChange('originalDateOfHire', e.target.value)}
            className="border-black"
          />
        </div>

        {/* Accident Scene */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="accidentScene" className="uppercase text-xs">
            Accident Scene:
          </Label>
          <p className="text-xs text-slate-600 mb-2">Describe the physical location and conditions where accident occurred</p>
          <Textarea
            id="accidentScene"
            value={formData.accidentScene}
            onChange={(e) => handleChange('accidentScene', e.target.value)}
            className="border-black min-h-[100px]"
            required
          />
        </div>

        {/* Safety Rule Question */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label className="uppercase text-xs">
              Did the accident occur from breaking an established safety rule or policy?
            </Label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="didBreakSafetyRule"
                  value="Y"
                  checked={formData.didBreakSafetyRule === 'Y'}
                  onChange={(e) => handleChange('didBreakSafetyRule', e.target.value)}
                />
                <span>Y</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="didBreakSafetyRule"
                  value="N"
                  checked={formData.didBreakSafetyRule === 'N'}
                  onChange={(e) => handleChange('didBreakSafetyRule', e.target.value)}
                />
                <span>N</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakSafetyRuleExplanation" className="uppercase text-xs">If "Yes" Explain:</Label>
            <Textarea
              id="breakSafetyRuleExplanation"
              value={formData.breakSafetyRuleExplanation}
              onChange={(e) => handleChange('breakSafetyRuleExplanation', e.target.value)}
              className="border-black min-h-[80px]"
              disabled={formData.didBreakSafetyRule !== 'Y'}
            />
          </div>
        </div>

        {/* Investigation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="investigatedBy" className="uppercase text-xs">Investigated By:</Label>
            <Input
              id="investigatedBy"
              value={formData.investigatedBy}
              onChange={(e) => handleChange('investigatedBy', e.target.value)}
              className="border-black"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investigationDate" className="uppercase text-xs">Date:</Label>
            <Input
              id="investigationDate"
              type="date"
              value={formData.investigationDate}
              onChange={(e) => handleChange('investigationDate', e.target.value)}
              className="border-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Investigation Photos */}
      <div className="border-t-2 border-black pt-6">
        <PhotoUpload
          photos={formData.photos}
          onChange={(photos) => handleChange('photos', photos)}
          label="Investigation Evidence Photos"
          maxPhotos={15}
        />
      </div>
    </div>
  );
}