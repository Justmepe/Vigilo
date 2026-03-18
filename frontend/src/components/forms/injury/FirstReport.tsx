import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { PhotoUpload } from './PhotoUpload';

interface FirstReportProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function FirstReport({ data, onUpdate }: FirstReportProps) {
  const [formData, setFormData] = useState({
    reporterName: '',
    employeeName: '',
    plant: '',
    dateOfReport: '',
    socialSecurityNumber: '',
    ukgEmployeeNumber: '',
    sex: '',
    dateTimeOfIncident: '',
    dateOfIncident: '',
    timeOfIncident: '',
    shift: '',
    addressExcludingCity: '',
    phoneNumber: '',
    emailAddress: '',
    emergencyContactNamePhone: '',
    natureOfInjury: '',
    bodyPartInjured: '',
    bodyPartInjuredOther: '',
    howDidIncidentHappen: '',
    jobTitle: '',
    whereWereYou: '',
    witness1Name: '',
    witness1Position: '',
    witness2Name: '',
    witness2Position: '',
    witness3Name: '',
    witness3Position: '',
    whereWereWitnesses: '',
    reportedRightAway: '',
    whyDelayedReport: '',
    osha300CaseNumber: '',
    osha300Applicable: '',
    photos: [],
    ...data
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>To be completed by Safety Team:</strong> Complete this initial report based on information gathered from the injured employee and witnesses.
        </p>
      </div>

      {/* Reporter Name */}
      <div className="space-y-2">
        <Label htmlFor="reporterName" className="uppercase text-xs">Safety Team Member Name (Person Completing This Form)</Label>
        <Input
          id="reporterName"
          value={formData.reporterName}
          onChange={(e) => handleChange('reporterName', e.target.value)}
          className="border-black"
          required
        />
      </div>

      {/* Employee Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employeeName" className="uppercase text-xs">Injured Employee Name</Label>
          <Input
            id="employeeName"
            value={formData.employeeName}
            onChange={(e) => handleChange('employeeName', e.target.value)}
            className="border-black"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plant" className="uppercase text-xs">Plant</Label>
          <Select
            value={formData.plant}
            onValueChange={(value) => handleChange('plant', value)}
          >
            <SelectTrigger className="border-black">
              <SelectValue placeholder="Select plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cordova">Cordova</SelectItem>
              <SelectItem value="Craig">Craig</SelectItem>
              <SelectItem value="Egegik">Egegik</SelectItem>
              <SelectItem value="False Pass">False Pass</SelectItem>
              <SelectItem value="False Pass South">False Pass South</SelectItem>
              <SelectItem value="Ketchikan">Ketchikan</SelectItem>
              <SelectItem value="Kodiak East">Kodiak East</SelectItem>
              <SelectItem value="Kodiak West">Kodiak West</SelectItem>
              <SelectItem value="Larson Bay">Larson Bay</SelectItem>
              <SelectItem value="Naknek">Naknek</SelectItem>
              <SelectItem value="Naknek West">Naknek West</SelectItem>
              <SelectItem value="Petersburg">Petersburg</SelectItem>
              <SelectItem value="Port Moller">Port Moller</SelectItem>
              <SelectItem value="Seattle Warehouse">Seattle Warehouse</SelectItem>
              <SelectItem value="Seward">Seward</SelectItem>
              <SelectItem value="Sitka">Sitka</SelectItem>
              <SelectItem value="Valdez">Valdez</SelectItem>
              <SelectItem value="Valdez Cannery">Valdez Cannery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfReport" className="uppercase text-xs">Date of Report</Label>
          <Input
            id="dateOfReport"
            type="date"
            value={formData.dateOfReport}
            onChange={(e) => handleChange('dateOfReport', e.target.value)}
            className="border-black"
            required
          />
        </div>
      </div>

      {/* Social Security & Sex & Date/Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="socialSecurityNumber" className="uppercase text-xs">Social Security Number</Label>
          <Input
            id="socialSecurityNumber"
            placeholder="XXX-XX-XXXX"
            value={formData.socialSecurityNumber}
            onChange={(e) => handleChange('socialSecurityNumber', e.target.value)}
            className="border-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ukgEmployeeNumber" className="uppercase text-xs">UKG Employee Number</Label>
          <Input
            id="ukgEmployeeNumber"
            value={formData.ukgEmployeeNumber}
            onChange={(e) => handleChange('ukgEmployeeNumber', e.target.value)}
            className="border-black"
          />
        </div>
        <div className="space-y-2">
          <Label className="uppercase text-xs">Sex</Label>
          <div className="flex gap-4 items-center h-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sex"
                value="M"
                checked={formData.sex === 'M'}
                onChange={(e) => handleChange('sex', e.target.value)}
              />
              <span>M</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sex"
                value="F"
                checked={formData.sex === 'F'}
                onChange={(e) => handleChange('sex', e.target.value)}
              />
              <span>F</span>
            </label>
          </div>
        </div>
      </div>

      {/* Date/Time and Shift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateTimeOfIncident" className="uppercase text-xs">Date & Time of Incident</Label>
          <Input
            id="dateTimeOfIncident"
            type="datetime-local"
            value={formData.dateTimeOfIncident}
            onChange={(e) => handleChange('dateTimeOfIncident', e.target.value)}
            className="border-black"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift" className="uppercase text-xs">Shift</Label>
          <Select
            value={formData.shift}
            onValueChange={(value) => handleChange('shift', value)}
          >
            <SelectTrigger className="border-black">
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Day</SelectItem>
              <SelectItem value="Night">Night</SelectItem>
              <SelectItem value="A">A Shift</SelectItem>
              <SelectItem value="B">B Shift</SelectItem>
              <SelectItem value="C">C Shift</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="addressExcludingCity" className="uppercase text-xs">Address, Excluding City and State:</Label>
          <Input
            id="addressExcludingCity"
            value={formData.addressExcludingCity}
            onChange={(e) => handleChange('addressExcludingCity', e.target.value)}
            className="border-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="uppercase text-xs">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="border-black"
          />
        </div>
      </div>

      {/* Email & Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emailAddress" className="uppercase text-xs">Email Address:</Label>
          <Input
            id="emailAddress"
            type="email"
            value={formData.emailAddress}
            onChange={(e) => handleChange('emailAddress', e.target.value)}
            className="border-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContactNamePhone" className="uppercase text-xs">Emergency Contact Name & Phone Number</Label>
          <Input
            id="emergencyContactNamePhone"
            value={formData.emergencyContactNamePhone}
            onChange={(e) => handleChange('emergencyContactNamePhone', e.target.value)}
            className="border-black"
          />
        </div>
      </div>

      {/* OSHA 300 Case Number */}
      <div className="space-y-2">
        <Label className="uppercase text-xs">OSHA 300 Applicable?</Label>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="osha300Applicable"
              value="Y"
              checked={formData.osha300Applicable === 'Y'}
              onChange={(e) => handleChange('osha300Applicable', e.target.value)}
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="osha300Applicable"
              value="N"
              checked={formData.osha300Applicable === 'N'}
              onChange={(e) => handleChange('osha300Applicable', e.target.value)}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {formData.osha300Applicable === 'Y' && (
        <div className="space-y-2">
          <Label htmlFor="osha300CaseNumber" className="uppercase text-xs">OSHA 300 Case Number</Label>
          <Input
            id="osha300CaseNumber"
            placeholder="e.g., 2024-001"
            value={formData.osha300CaseNumber}
            onChange={(e) => handleChange('osha300CaseNumber', e.target.value)}
            className="border-black"
          />
          <p className="text-xs text-slate-500">
            Enter the OSHA 300 Log case number for this recordable injury or illness
          </p>
        </div>
      )}

      {/* Nature of Injury */}
      <div className="space-y-2">
        <Label htmlFor="natureOfInjury" className="uppercase text-xs">
          Nature of Injury
        </Label>
        <Select
          value={formData.natureOfInjury}
          onValueChange={(value) => handleChange('natureOfInjury', value)}
        >
          <SelectTrigger className="border-black">
            <SelectValue placeholder="Select nature of injury" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Amputation (Cut off)">Amputation (Cut off)</SelectItem>
            <SelectItem value="Asbestos Lung Disease">Asbestos Lung Disease</SelectItem>
            <SelectItem value="Black Lung">Black Lung</SelectItem>
            <SelectItem value="Blindness / Vision Loss">Blindness / Vision Loss</SelectItem>
            <SelectItem value="Broken Bone">Broken Bone</SelectItem>
            <SelectItem value="Bruise">Bruise</SelectItem>
            <SelectItem value="Burn (Chemical)">Burn (Chemical)</SelectItem>
            <SelectItem value="Burn (Heat or Fire)">Burn (Heat or Fire)</SelectItem>
            <SelectItem value="Cancer">Cancer</SelectItem>
            <SelectItem value="Carpal Tunnel">Carpal Tunnel</SelectItem>
            <SelectItem value="Chemical Poisoning">Chemical Poisoning</SelectItem>
            <SelectItem value="Chest Pain (Heart)">Chest Pain (Heart)</SelectItem>
            <SelectItem value="Concussion">Concussion</SelectItem>
            <SelectItem value="Contagious Disease (Flu, Virus)">Contagious Disease (Flu, Virus)</SelectItem>
            <SelectItem value="COVID-19">COVID-19</SelectItem>
            <SelectItem value="Crushing Injury">Crushing Injury</SelectItem>
            <SelectItem value="Cut / Scratch">Cut / Scratch</SelectItem>
            <SelectItem value="Dislocation">Dislocation</SelectItem>
            <SelectItem value="Dust Lung Disease">Dust Lung Disease</SelectItem>
            <SelectItem value="Electric Shock">Electric Shock</SelectItem>
            <SelectItem value="Fainting">Fainting</SelectItem>
            <SelectItem value="Foreign Object in Body">Foreign Object in Body</SelectItem>
            <SelectItem value="Frostbite / Freezing">Frostbite / Freezing</SelectItem>
            <SelectItem value="Hearing Loss (Gradual)">Hearing Loss (Gradual)</SelectItem>
            <SelectItem value="Hearing Loss (Sudden)">Hearing Loss (Sudden)</SelectItem>
            <SelectItem value="Heart Attack">Heart Attack</SelectItem>
            <SelectItem value="Heat Stroke / Exhaustion">Heat Stroke / Exhaustion</SelectItem>
            <SelectItem value="Hernia">Hernia</SelectItem>
            <SelectItem value="Infection">Infection</SelectItem>
            <SelectItem value="Inflammation / Swelling">Inflammation / Swelling</SelectItem>
            <SelectItem value="Mental Health Condition">Mental Health Condition</SelectItem>
            <SelectItem value="Metal Poisoning">Metal Poisoning</SelectItem>
            <SelectItem value="Poisoning (General)">Poisoning (General)</SelectItem>
            <SelectItem value="Puncture / Stab">Puncture / Stab</SelectItem>
            <SelectItem value="Radiation Exposure">Radiation Exposure</SelectItem>
            <SelectItem value="Respiratory / Breathing Problem">Respiratory / Breathing Problem</SelectItem>
            <SelectItem value="Rupture / Tear">Rupture / Tear</SelectItem>
            <SelectItem value="Severed Body Part">Severed Body Part</SelectItem>
            <SelectItem value="Silica Lung Disease">Silica Lung Disease</SelectItem>
            <SelectItem value="Skin Rash">Skin Rash</SelectItem>
            <SelectItem value="Sprain (Ligament injury)">Sprain (Ligament injury)</SelectItem>
            <SelectItem value="Strain (Muscle injury)">Strain (Muscle injury)</SelectItem>
            <SelectItem value="Stress">Stress</SelectItem>
            <SelectItem value="Stroke">Stroke</SelectItem>
            <SelectItem value="Suffocation / Choking">Suffocation / Choking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Part Injured */}
      <div className="space-y-2">
        <Label htmlFor="bodyPartInjured" className="uppercase text-xs">
          Affected Body Part
        </Label>
        <Select
          value={formData.bodyPartInjured}
          onValueChange={(value) => handleChange('bodyPartInjured', value)}
        >
          <SelectTrigger className="border-black">
            <SelectValue placeholder="Select body part" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ankle">Ankle</SelectItem>
            <SelectItem value="Artificial Aid (Glasses, Contacts, Braces)">Artificial Aid (Glasses, Contacts, Braces)</SelectItem>
            <SelectItem value="Back Bones (Spine)">Back Bones (Spine)</SelectItem>
            <SelectItem value="Big Toe">Big Toe</SelectItem>
            <SelectItem value="Brain">Brain</SelectItem>
            <SelectItem value="Chest / Ribs">Chest / Ribs</SelectItem>
            <SelectItem value="Ear">Ear</SelectItem>
            <SelectItem value="Elbow">Elbow</SelectItem>
            <SelectItem value="Eye">Eye</SelectItem>
            <SelectItem value="Face">Face</SelectItem>
            <SelectItem value="Facial Bones (Jaw/Cheek)">Facial Bones (Jaw/Cheek)</SelectItem>
            <SelectItem value="Finger">Finger</SelectItem>
            <SelectItem value="Foot">Foot</SelectItem>
            <SelectItem value="Forearm">Forearm</SelectItem>
            <SelectItem value="Hand">Hand</SelectItem>
            <SelectItem value="Heart">Heart</SelectItem>
            <SelectItem value="Hip / Pelvis">Hip / Pelvis</SelectItem>
            <SelectItem value="Internal Organs">Internal Organs</SelectItem>
            <SelectItem value="Knee">Knee</SelectItem>
            <SelectItem value="Lower Back">Lower Back</SelectItem>
            <SelectItem value="Lower Leg / Calf">Lower Leg / Calf</SelectItem>
            <SelectItem value="Lungs">Lungs</SelectItem>
            <SelectItem value="Mouth / Lips">Mouth / Lips</SelectItem>
            <SelectItem value="Neck">Neck</SelectItem>
            <SelectItem value="Neck Bones">Neck Bones</SelectItem>
            <SelectItem value="Nose">Nose</SelectItem>
            <SelectItem value="Scalp">Scalp</SelectItem>
            <SelectItem value="Shoulder">Shoulder</SelectItem>
            <SelectItem value="Skull">Skull</SelectItem>
            <SelectItem value="Spinal Cord (Back)">Spinal Cord (Back)</SelectItem>
            <SelectItem value="Spinal Cord (Neck)">Spinal Cord (Neck)</SelectItem>
            <SelectItem value="Stomach / Groin">Stomach / Groin</SelectItem>
            <SelectItem value="Tailbone">Tailbone</SelectItem>
            <SelectItem value="Teeth">Teeth</SelectItem>
            <SelectItem value="Thigh">Thigh</SelectItem>
            <SelectItem value="Throat / Voice Box">Throat / Voice Box</SelectItem>
            <SelectItem value="Thumb">Thumb</SelectItem>
            <SelectItem value="Toes">Toes</SelectItem>
            <SelectItem value="Upper Arm">Upper Arm</SelectItem>
            <SelectItem value="Upper Back">Upper Back</SelectItem>
            <SelectItem value="Whole Body (Multiple injuries)">Whole Body (Multiple injuries)</SelectItem>
            <SelectItem value="Whole Body System (Infection/Poisoning)">Whole Body System (Infection/Poisoning)</SelectItem>
            <SelectItem value="Wrist">Wrist</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Select the primary body part affected by the injury or illness.
        </p>
      </div>

      {/* Additional Body Part Details */}
      {(formData.bodyPartInjured === 'Whole Body (Multiple injuries)' || formData.bodyPartInjured === 'Other') && (
        <div className="space-y-2">
          <Label htmlFor="bodyPartInjuredOther" className="uppercase text-xs">
            {formData.bodyPartInjured === 'Whole Body (Multiple injuries)' 
              ? 'List all injured body parts:' 
              : 'Specify body part:'}
          </Label>
          <Textarea
            id="bodyPartInjuredOther"
            value={formData.bodyPartInjuredOther}
            onChange={(e) => handleChange('bodyPartInjuredOther', e.target.value)}
            className="border-black min-h-[80px]"
            required
          />
        </div>
      )}

      {/* How Did Incident Happen */}
      <div className="space-y-2">
        <Label htmlFor="howDidIncidentHappen" className="uppercase text-xs">
          How did the incident happen? Describe in detail how you were injured & what you were doing
        </Label>
        <Textarea
          id="howDidIncidentHappen"
          value={formData.howDidIncidentHappen}
          onChange={(e) => handleChange('howDidIncidentHappen', e.target.value)}
          className="border-black min-h-[120px]"
          required
        />
      </div>

      {/* Job Title & Where Were You */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="uppercase text-xs">Job Title:</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            className="border-black"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whereWereYou" className="uppercase text-xs">Where were you when this happened?</Label>
          <Input
            id="whereWereYou"
            value={formData.whereWereYou}
            onChange={(e) => handleChange('whereWereYou', e.target.value)}
            className="border-black"
            required
          />
        </div>
      </div>

      {/* Witnesses Section */}
      <div className="border-t-2 border-black pt-6">
        <h3 className="uppercase text-xs mb-4">Did anyone see the incident happen?</h3>
        
        <div className="space-y-3">
          {/* Witness 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="witness1Name" className="uppercase text-xs">Witness 1 - Name</Label>
              <Input
                id="witness1Name"
                value={formData.witness1Name}
                onChange={(e) => handleChange('witness1Name', e.target.value)}
                className="border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witness1Position" className="uppercase text-xs">Position</Label>
              <Input
                id="witness1Position"
                value={formData.witness1Position}
                onChange={(e) => handleChange('witness1Position', e.target.value)}
                className="border-black"
              />
            </div>
          </div>

          {/* Witness 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="witness2Name" className="uppercase text-xs">Witness 2 - Name</Label>
              <Input
                id="witness2Name"
                value={formData.witness2Name}
                onChange={(e) => handleChange('witness2Name', e.target.value)}
                className="border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witness2Position" className="uppercase text-xs">Position</Label>
              <Input
                id="witness2Position"
                value={formData.witness2Position}
                onChange={(e) => handleChange('witness2Position', e.target.value)}
                className="border-black"
              />
            </div>
          </div>

          {/* Witness 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="witness3Name" className="uppercase text-xs">Witness 3 - Name</Label>
              <Input
                id="witness3Name"
                value={formData.witness3Name}
                onChange={(e) => handleChange('witness3Name', e.target.value)}
                className="border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witness3Position" className="uppercase text-xs">Position</Label>
              <Input
                id="witness3Position"
                value={formData.witness3Position}
                onChange={(e) => handleChange('witness3Position', e.target.value)}
                className="border-black"
              />
            </div>
          </div>

          {/* Where Were Witnesses */}
          <div className="space-y-2">
            <Label htmlFor="whereWereWitnesses" className="uppercase text-xs">
              Where were these people? (Example: working next to you)
            </Label>
            <Input
              id="whereWereWitnesses"
              value={formData.whereWereWitnesses}
              onChange={(e) => handleChange('whereWereWitnesses', e.target.value)}
              className="border-black"
            />
          </div>
        </div>
      </div>

      {/* Reporting Questions */}
      <div className="border-t-2 border-black pt-6 space-y-4">
        <div className="space-y-2">
          <Label className="uppercase text-xs">Did you report this right away?</Label>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportedRightAway"
                value="Y"
                checked={formData.reportedRightAway === 'Y'}
                onChange={(e) => handleChange('reportedRightAway', e.target.value)}
              />
              <span>Y</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportedRightAway"
                value="N"
                checked={formData.reportedRightAway === 'N'}
                onChange={(e) => handleChange('reportedRightAway', e.target.value)}
              />
              <span>N</span>
            </label>
            <div className="flex-1 ml-4">
              <Label htmlFor="whyDelayedReport" className="uppercase text-xs">If No, Why Did You Wait?</Label>
              <Input
                id="whyDelayedReport"
                value={formData.whyDelayedReport}
                onChange={(e) => handleChange('whyDelayedReport', e.target.value)}
                className="border-black mt-1"
                disabled={formData.reportedRightAway !== 'N'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="border-t-2 border-black pt-6">
        <PhotoUpload
          photos={formData.photos}
          onChange={(photos) => handleChange('photos', photos)}
          label="Incident Scene Photos"
          maxPhotos={10}
        />
      </div>
    </div>
  );
}