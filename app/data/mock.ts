interface User {
    id: number;
    name: string;
  }
  
  interface Appointment {
    id: number;
    user: User;
    title: string;
    start: string;
    end: string;
    gpunum: number;
  }
  
  export const mockUsers: User[] = [
    { id: 1, name: '白维康' },
    { id: 2, name: '叶兴松' }
  ];
  
  export const mockAppointments: Appointment[] = [
    {
      id: 1,
      user: mockUsers[0],
      title: `${mockUsers[0].name} (2 GPU)`,
      start: '2025-01-22T00:00:00',
      end: '2025-01-23T00:00:00',
      gpunum: 2
    },
    {
      id: 2,
      user: mockUsers[1],
      title: `${mockUsers[1].name} (4 GPU)`,
      start: '2025-01-20T00:00:00',
      end: '2025-01-25T00:00:00',
      gpunum: 4
    }
  ];