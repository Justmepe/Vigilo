import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PhotoUpload } from './PhotoUpload';

interface RootCauseActionProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function RootCauseAction({ data, onUpdate }: RootCauseActionProps) {
  const [formData, setFormData] = useState({
    whyAnalysis: ['', '', '', '', ''],
    immediateRootCause: '',
    underlyingRootCause: '',
    systemicIssues: '',
    correctiveAction: '',
    responsiblePerson: '',
    dueDate: '',
    preventiveMeasure: '',
    verificationMethod: '',
    verificationDate: '',
    effectiveness: '',
    lessonsLearned: '',
    photos: [],
    ...data
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateWhyAnalysis = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      whyAnalysis: prev.whyAnalysis.map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
        <p className="text-sm text-green-900">
          <strong>Collaborative Section:</strong> Work together with Safety and Management to complete this root cause analysis and corrective action plan.
        </p>
      </div>

      <div>
        <h2 className="text-slate-900 mb-1">Root Cause & Corrective Action</h2>
        <p className="text-slate-600">Use the 5 Whys method to identify root causes and implement corrective measures</p>
      </div>

      {/* 5 Whys Analysis */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-2">5 Whys Analysis</h3>
        <p className="text-slate-600 text-sm mb-4">Ask "why" five times to drill down to the root cause</p>
        
        <div className="space-y-3">
          {formData.whyAnalysis.map((why: string, index: number) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`why-${index}`} className="uppercase text-xs">Why #{index + 1}</Label>
              <Input
                id={`why-${index}`}
                placeholder={`Why did this happen?`}
                value={why}
                onChange={(e) => updateWhyAnalysis(index, e.target.value)}
                className="border-black"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Identification */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-4">Root Cause Identification</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="immediateRootCause" className="uppercase text-xs">Immediate Root Cause *</Label>
            <Textarea
              id="immediateRootCause"
              placeholder="What directly caused the incident?"
              value={formData.immediateRootCause}
              onChange={(e) => handleChange('immediateRootCause', e.target.value)}
              className="border-black min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="underlyingRootCause" className="uppercase text-xs">Underlying Root Cause *</Label>
            <Textarea
              id="underlyingRootCause"
              placeholder="What systemic issues allowed this to happen?"
              value={formData.underlyingRootCause}
              onChange={(e) => handleChange('underlyingRootCause', e.target.value)}
              className="border-black min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemicIssues" className="uppercase text-xs">Systemic Issues Identified</Label>
            <Textarea
              id="systemicIssues"
              placeholder="Organizational or process issues that contributed..."
              value={formData.systemicIssues}
              onChange={(e) => handleChange('systemicIssues', e.target.value)}
              className="border-black min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Corrective Action */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-4">Corrective Action</h3>
        <p className="text-slate-600 text-sm mb-4">Action to prevent recurrence of this incident</p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="correctiveAction" className="uppercase text-xs">Corrective Action *</Label>
            <Textarea
              id="correctiveAction"
              placeholder="Describe the corrective action to be taken..."
              value={formData.correctiveAction}
              onChange={(e) => handleChange('correctiveAction', e.target.value)}
              className="border-black min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsiblePerson" className="uppercase text-xs">Responsible Person *</Label>
              <Input
                id="responsiblePerson"
                placeholder="Name"
                value={formData.responsiblePerson}
                onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                className="border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="uppercase text-xs">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="border-black"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preventive Measure */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-4">Preventive Measure</h3>
        <p className="text-slate-600 text-sm mb-4">Long-term prevention strategy to address systemic issues</p>
        
        <div className="space-y-2">
          <Label htmlFor="preventiveMeasure" className="uppercase text-xs">Preventive Measure</Label>
          <Textarea
            id="preventiveMeasure"
            placeholder="What measures will prevent similar incidents in the future? (Include policy changes, training needs, procedure updates, etc.)"
            value={formData.preventiveMeasure}
            onChange={(e) => handleChange('preventiveMeasure', e.target.value)}
            className="border-black min-h-[120px]"
          />
        </div>
      </div>

      {/* Verification and Follow-up */}
      <div className="border-t pt-6">
        <h3 className="text-slate-900 mb-4">Verification & Follow-up</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verificationMethod" className="uppercase text-xs">Verification Method</Label>
            <Input
              id="verificationMethod"
              placeholder="How will effectiveness be verified?"
              value={formData.verificationMethod}
              onChange={(e) => handleChange('verificationMethod', e.target.value)}
              className="border-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verificationDate" className="uppercase text-xs">Verification Date</Label>
              <Input
                id="verificationDate"
                type="date"
                value={formData.verificationDate}
                onChange={(e) => handleChange('verificationDate', e.target.value)}
                className="border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveness" className="uppercase text-xs">Effectiveness Rating</Label>
              <Select value={formData.effectiveness} onValueChange={(value) => handleChange('effectiveness', value)}>
                <SelectTrigger id="effectiveness" className="border-black">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-verified">Not Yet Verified</SelectItem>
                  <SelectItem value="effective">Effective</SelectItem>
                  <SelectItem value="partially-effective">Partially Effective</SelectItem>
                  <SelectItem value="not-effective">Not Effective</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonsLearned" className="uppercase text-xs">Lessons Learned</Label>
            <Textarea
              id="lessonsLearned"
              placeholder="Key takeaways and lessons learned from this incident..."
              value={formData.lessonsLearned}
              onChange={(e) => handleChange('lessonsLearned', e.target.value)}
              className="border-black min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Corrective Action Photos */}
      <div className="border-t-2 border-black pt-6">
        <PhotoUpload
          photos={formData.photos}
          onChange={(photos) => handleChange('photos', photos)}
          label="Corrective Action Documentation Photos"
          maxPhotos={10}
        />
      </div>
    </div>
  );
}