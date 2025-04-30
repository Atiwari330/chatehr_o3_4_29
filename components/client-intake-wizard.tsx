'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { PlusIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';

type PatientProfileData = {
  // Demographics
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD format
  gender: string;
  pronouns: string;
  
  // Contact & Insurance
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceName: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  
  // Clinical
  chiefComplaint: string;
  primaryDiagnosis: string;
  otherDiagnoses: string[];
  medications: string[];
  allergies: string[];
  riskFactors: string[];
  socialHistory: string;
};

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
const PRONOUN_OPTIONS = ['he/him', 'she/her', 'they/them', 'Other'];
const INSURANCE_OPTIONS = ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Medicaid', 'Other', 'Self-pay'];
const DIAGNOSIS_OPTIONS = ['Major Depressive Disorder', 'Generalized Anxiety Disorder', 'Bipolar Disorder', 'PTSD', 'Substance Use Disorder', 'ADHD', 'Other'];
const MEDICATION_OPTIONS = ['Sertraline (Zoloft)', 'Escitalopram (Lexapro)', 'Fluoxetine (Prozac)', 'Bupropion (Wellbutrin)', 'Alprazolam (Xanax)', 'Adderall', 'Other'];

export function ClientIntakeWizard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PatientProfileData>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    pronouns: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceName: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    chiefComplaint: '',
    primaryDiagnosis: '',
    otherDiagnoses: [],
    medications: [],
    allergies: [],
    riskFactors: [],
    socialHistory: '',
  });

  // Basic validation - just required fields (name and DOB)
  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.dob.trim() !== '' &&
        /^\d{4}-\d{2}-\d{2}$/.test(formData.dob)
      );
    }
    return true; // Other steps have no required fields
  };

  const goToNextStep = () => {
    if (isStepValid()) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Update form data when inputs change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'otherDiagnoses' || name === 'medications' || name === 'allergies' || name === 'riskFactors') {
      // Split input by commas to create array
      setFormData({
        ...formData,
        [name]: value.split(',').map(item => item.trim()).filter(Boolean),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepValid()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the payload - keep required fields directly, put the rest in profile
      const {
        firstName,
        lastName,
        dob,
        gender,
        ...profileData
      } = formData;

      // For diagnoses compatibility
      const diagnoses = [formData.primaryDiagnosis, ...formData.otherDiagnoses].filter(Boolean);

      const payload = {
        firstName,
        lastName,
        dob,
        gender,
        diagnoses,
        profile: profileData,
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        toast.success('Client added successfully');
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add client');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error adding client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      pronouns: '',
      email: '',
      phone: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      insuranceName: '',
      insurancePolicyNumber: '',
      insuranceGroupNumber: '',
      chiefComplaint: '',
      primaryDiagnosis: '',
      otherDiagnoses: [],
      medications: [],
      allergies: [],
      riskFactors: [],
      socialHistory: '',
    });
    setStep(1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Date of Birth *
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="col-span-3"
                required
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender Identity
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender identity" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pronouns" className="text-right">
                Pronouns
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.pronouns}
                  onValueChange={(value) => handleSelectChange('pronouns', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRONOUN_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <Separator className="my-2" />
            <h4 className="text-sm font-medium">Emergency Contact</h4>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyContactName" className="text-right">
                Name
              </Label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyContactPhone" className="text-right">
                Phone
              </Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <Separator className="my-2" />
            <h4 className="text-sm font-medium">Insurance Information</h4>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="insuranceName" className="text-right">
                Insurance
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.insuranceName}
                  onValueChange={(value) => handleSelectChange('insuranceName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="insurancePolicyNumber" className="text-right">
                Policy #
              </Label>
              <Input
                id="insurancePolicyNumber"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="insuranceGroupNumber" className="text-right">
                Group #
              </Label>
              <Input
                id="insuranceGroupNumber"
                name="insuranceGroupNumber"
                value={formData.insuranceGroupNumber}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chiefComplaint" className="text-right">
                Chief Complaint
              </Label>
              <Input
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryDiagnosis" className="text-right">
                Primary Diagnosis
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.primaryDiagnosis}
                  onValueChange={(value) => handleSelectChange('primaryDiagnosis', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary diagnosis" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAGNOSIS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otherDiagnoses" className="text-right">
                Other Diagnoses
              </Label>
              <Input
                id="otherDiagnoses"
                name="otherDiagnoses"
                value={formData.otherDiagnoses.join(', ')}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Separate by commas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medications" className="text-right">
                Medications
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.medications[0] || ''}
                  onValueChange={(value) => {
                    const updatedMeds = [value, ...(formData.medications.slice(1) || [])];
                    setFormData({
                      ...formData,
                      medications: updatedMeds
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICATION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="mt-2"
                  placeholder="Additional medications (comma separated)"
                  value={formData.medications.slice(1).join(', ')}
                  onChange={(e) => {
                    const additionalMeds = e.target.value
                      .split(',')
                      .map(item => item.trim())
                      .filter(Boolean);
                    
                    setFormData({
                      ...formData,
                      medications: [formData.medications[0] || '', ...additionalMeds]
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="allergies" className="text-right">
                Allergies
              </Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies.join(', ')}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Separate by commas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="riskFactors" className="text-right">
                Risk Factors
              </Label>
              <Input
                id="riskFactors"
                name="riskFactors"
                value={formData.riskFactors.join(', ')}
                onChange={handleChange}
                className="col-span-3"
                placeholder="e.g., SI/HI, substance use (separate by commas)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="socialHistory" className="text-right">
                Social History
              </Label>
              <Input
                id="socialHistory"
                name="socialHistory"
                value={formData.socialHistory}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Brief social/family context"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (newOpen === false && !isLoading) {
        // Reset if closing
        resetForm();
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon size={16} />
          <span>Add Client</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {step === 1 && "Demographics"}
              {step === 2 && "Contact & Insurance"}
              {step === 3 && "Clinical Information"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "Enter client demographic information. Fields marked with * are required."}
              {step === 2 && "Contact and insurance information (all fields optional)."}
              {step === 3 && "Clinical and biopsychosocial information (all fields optional)."}
            </DialogDescription>
          </DialogHeader>
          
          {/* Step indicators */}
          <div className="flex justify-between mb-4 mt-2">
            <div className="flex items-center">
              <div className={`rounded-full w-6 h-6 flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'border border-muted-foreground text-muted-foreground'}`}>
                {step > 1 ? <CheckIcon size={14} /> : '1'}
              </div>
              <div className={`h-1 w-8 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`rounded-full w-6 h-6 flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'border border-muted-foreground text-muted-foreground'}`}>
                {step > 2 ? <CheckIcon size={14} /> : '2'}
              </div>
              <div className={`h-1 w-8 ${step > 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`rounded-full w-6 h-6 flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'border border-muted-foreground text-muted-foreground'}`}>
                3
              </div>
            </div>
          </div>
          
          {renderStepContent()}
          
          <DialogFooter className="gap-2 sm:gap-0">
            {step > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={goToPreviousStep}
                className="sm:mr-auto"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {step === 3 ? (
              <Button type="submit" disabled={isLoading || !isStepValid()}>
                {isLoading ? 'Saving...' : 'Save Client'}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={goToNextStep} 
                disabled={!isStepValid()}
              >
                Next
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
