import { api } from '@/services/api';

export const programsService = {
  async getPrograms() {
    try {
      return await api.get('/programs');
    } catch {
      return [];
    }
  },
  
  async createProgram(program: any) {
    return await api.post('/programs', program);
  },
  
  async updateProgram(id: string, program: any) {
    return await api.put(`/programs/${id}`, program);
  },
  
  async deleteProgram(id: string) {
    return await api.delete(`/programs/${id}`);
  }
};
