'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
};

export function ClientSelector({ 
  onSelectClient 
}: { 
  onSelectClient: (clientId: string | null) => void 
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        console.log('Fetching clients...');
        // Based on Next.js route groups, the correct path should include the route group
        const response = await fetch('/api/patients');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched clients:', data);
          if (Array.isArray(data) && data.length > 0) {
            setClients(data);
          } else {
            console.log('No clients found or empty array returned');
          }
        } else {
          console.error('Failed to fetch clients:', await response.text());
          
          // Fallback to try another path if the first one failed
          console.log('Trying alternate path...');
          const altResponse = await fetch('/(ehr)/api/patients');
          console.log('Alt response status:', altResponse.status);
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('Fetched clients from alt path:', altData);
            if (Array.isArray(altData) && altData.length > 0) {
              setClients(altData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load clients', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, []);

  if (isLoading) {
    return <Skeleton className="w-[180px] h-[36px]" />;
  }

  return (
    <Select onValueChange={(value) => onSelectClient(value || null)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select client (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No client selected</SelectItem>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.firstName} {client.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
