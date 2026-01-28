import api from './api';

// Types
export interface Laboratory {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabTest {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  preparationInfo?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  laboratoryId?: string;
  laboratory?: Laboratory;
  isActive: boolean;
  createdAt: string;
}

export interface LabOrderItem {
  id: string;
  labTestId: string;
  labTest?: LabTest;
  price: number;
  result?: string;
  status: 'pending' | 'completed';
}

export interface LabOrder {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    phone: string;
  };
  laboratoryId?: string;
  laboratory?: Laboratory;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime?: string;
  totalPrice: number;
  items?: LabOrderItem[];
  results?: any;
  resultFileUrl?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateLabOrderDto {
  labTestIds: string[];
  laboratoryId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  notes?: string;
}

export interface UpdateLabResultDto {
  results: {
    testId: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
  conclusion?: string;
  doctorNotes?: string;
}

// ==================== LABORATORIES ====================

export const laboratoryService = {
  // Get all laboratories
  getAll: async (): Promise<Laboratory[]> => {
    const response = await api.get('/laboratories');
    return response.data.data || [];
  },

  // Get laboratory by ID
  getById: async (id: string): Promise<Laboratory> => {
    const response = await api.get(`/laboratories/${id}`);
    return response.data.data;
  },

  // Create laboratory (Admin)
  create: async (data: Partial<Laboratory>): Promise<Laboratory> => {
    const response = await api.post('/laboratories', data);
    return response.data.data;
  },

  // Update laboratory (Admin)
  update: async (id: string, data: Partial<Laboratory>): Promise<Laboratory> => {
    const response = await api.patch(`/laboratories/${id}`, data);
    return response.data.data;
  },

  // Delete laboratory (Admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/laboratories/${id}`);
  },

  // Toggle laboratory status (Admin)
  toggle: async (id: string): Promise<Laboratory> => {
    const response = await api.patch(`/laboratories/${id}/toggle`);
    return response.data.data;
  },
};

// ==================== LAB TESTS ====================

export const labTestService = {
  // Get all lab tests
  getAll: async (params?: { categoryId?: string; laboratoryId?: string }): Promise<LabTest[]> => {
    const response = await api.get('/lab-tests', { params });
    return response.data.data || [];
  },

  // Get lab test by ID
  getById: async (id: string): Promise<LabTest> => {
    const response = await api.get(`/lab-tests/${id}`);
    return response.data.data;
  },

  // Create lab test (Admin)
  create: async (data: Partial<LabTest>): Promise<LabTest> => {
    const response = await api.post('/lab-tests', data);
    return response.data.data;
  },

  // Update lab test (Admin)
  update: async (id: string, data: Partial<LabTest>): Promise<LabTest> => {
    const response = await api.patch(`/lab-tests/${id}`, data);
    return response.data.data;
  },

  // Delete lab test (Admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/lab-tests/${id}`);
  },
};

// ==================== LAB ORDERS ====================

export const labOrderService = {
  // Get my lab orders (User)
  getMyOrders: async (): Promise<LabOrder[]> => {
    const response = await api.get('/lab-orders/my');
    return response.data.data || [];
  },

  // Get my order by ID (User)
  getMyOrderById: async (id: string): Promise<LabOrder> => {
    const response = await api.get(`/lab-orders/my/${id}`);
    return response.data.data;
  },

  // Create lab order (User)
  create: async (data: CreateLabOrderDto): Promise<LabOrder> => {
    const response = await api.post('/lab-orders', data);
    return response.data.data;
  },

  // Cancel my order (User)
  cancelMyOrder: async (id: string): Promise<LabOrder> => {
    const response = await api.patch(`/lab-orders/my/${id}/cancel`);
    return response.data.data;
  },

  // Get all orders (Admin/Lab)
  getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<LabOrder[]> => {
    const response = await api.get('/lab-orders', { params });
    return response.data.data || [];
  },

  // Get order by ID (Admin/Lab)
  getById: async (id: string): Promise<LabOrder> => {
    const response = await api.get(`/lab-orders/${id}`);
    return response.data.data;
  },

  // Update order status (Admin/Lab)
  updateStatus: async (id: string, status: string): Promise<LabOrder> => {
    const response = await api.patch(`/lab-orders/${id}/status`, { status });
    return response.data.data;
  },

  // Update order results (Admin/Lab)
  updateResults: async (id: string, data: UpdateLabResultDto): Promise<LabOrder> => {
    const response = await api.patch(`/lab-orders/${id}/results`, data);
    return response.data.data;
  },

  // Get lab order stats (Admin)
  getStats: async (): Promise<any> => {
    const response = await api.get('/lab-orders/stats');
    return response.data.data;
  },
};
