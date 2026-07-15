import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorsApi } from '@/services/mysqlApi';

export interface InstructorBase {
  id: string;
  name: string;
  title: string;
  specialization: string;
  experience: string;
  certifications: string[];
  rating: number;
  students: string;
  description: string;
  image: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  featured?: boolean;
  signature_url?: string;
  connected_user?: string;
}

export const useInstructorsData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const data = await instructorsApi.getAll();
      return (data || []).map((inst: any) => ({
        ...inst,
        certifications: typeof inst.certifications === 'string' ? JSON.parse(inst.certifications) : (inst.certifications || [])
      }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InstructorBase> }) => {
      const payload = {
        ...data,
        certifications: data.certifications ? JSON.stringify(data.certifications) : '[]'
      };
      await instructorsApi.update(id, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructors'] })
  });

  const createMutation = useMutation({
    mutationFn: async (data: InstructorBase) => {
      const payload = {
        ...data,
        certifications: data.certifications ? JSON.stringify(data.certifications) : '[]'
      };
      await instructorsApi.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructors'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await instructorsApi.remove(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructors'] })
  });

  return {
    instructors: query.data || [],
    isLoading: query.isLoading,
    updateInstructor: updateMutation.mutate,
    createInstructor: createMutation.mutate,
    deleteInstructor: deleteMutation.mutate
  };
};
