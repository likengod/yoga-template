import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/services/mysqlApi';
import { OnlineClass } from '@/types/admin';

export const useClassesData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const data = await classesApi.getAll();
      return (data || []).map((cls: any) => ({
        ...cls,
        features: typeof cls.features === 'string' ? JSON.parse(cls.features) : (cls.features || [])
      }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OnlineClass> }) => {
      const payload = {
        ...data,
        features: data.features ? JSON.stringify(data.features) : '[]'
      };
      await classesApi.update(id, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });

  const createMutation = useMutation({
    mutationFn: async (data: OnlineClass) => {
      const payload = {
        ...data,
        features: data.features ? JSON.stringify(data.features) : '[]'
      };
      await classesApi.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await classesApi.remove(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });

  return {
    classes: query.data || [],
    isLoading: query.isLoading,
    updateClass: updateMutation.mutate,
    createClass: createMutation.mutate,
    deleteClass: deleteMutation.mutate
  };
};
