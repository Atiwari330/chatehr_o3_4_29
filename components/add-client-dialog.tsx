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
import { toast } from 'sonner';
import { UsersIcon, PlusIcon } from 'lucide-react';

type PatientFormData = {
  firstName: string;
  lastName: string;
  dob: string;
  diagnoses: string[];
};

export function AddClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dob: '',
    diagnoses: [],
  });

  // Simple validation - all required fields are filled
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.dob.trim() !== '' &&
      /^\d{4}-\d{2}-\d{2}$/.test(formData.dob)
    );
  };

  // Update form data when inputs change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'diagnoses') {
      // Split input by commas to create array of diagnoses
      setFormData({
        ...formData,
        diagnoses: value.split(',').map(item => item.trim()).filter(Boolean),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        toast.success('Client added successfully');
        setOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          dob: '',
          diagnoses: [],
        });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon size={16} />
          <span>Add Client</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter client information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="diagnoses" className="text-right">
                Diagnoses
              </Label>
              <Input
                id="diagnoses"
                name="diagnoses"
                value={formData.diagnoses.join(', ')}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Separate by commas"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isFormValid()}>
              {isLoading ? 'Saving...' : 'Save Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 