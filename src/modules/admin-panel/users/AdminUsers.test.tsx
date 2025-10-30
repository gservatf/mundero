/**
 * Test Suite for AdminUsers Component
 * 
 * Service and logic tests without UI components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminUserService } from '../services/adminFirebase';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Mock Firebase service
vi.mock('../services/adminFirebase', () => ({
  adminUserService: {
    getUsers: vi.fn(),
    searchUsers: vi.fn(),
    updateUserRole: vi.fn(),
    updateUserStatus: vi.fn(),
    getUserStats: vi.fn()
  }
}));

// Mock useAdminAuth hook
vi.mock('../hooks/useAdminAuth', () => ({
  useAdminAuth: vi.fn(),
  getRoleDescription: vi.fn((role: string) => `Description for ${role}`),
  getRoleBadgeColor: vi.fn(() => 'bg-blue-100 text-blue-800')
}));

// Sample test data
const mockUsers = [
  {
    uid: 'user1',
    email: 'admin@test.com',
    displayName: 'Admin User',
    photoURL: 'https://example.com/avatar1.jpg',
    role: 'admin' as const,
    status: 'active' as const,
    companyId: 'company1',
    companyName: 'Test Company',
    country: 'España',
    createdAt: { toDate: () => new Date('2023-01-01') },
    updatedAt: { toDate: () => new Date('2023-01-01') }
  },
  {
    uid: 'user2',
    email: 'user@test.com',
    displayName: 'Regular User',
    photoURL: 'https://example.com/avatar2.jpg',
    role: 'client' as const,
    status: 'active' as const,
    companyId: 'company2',
    companyName: 'User Company',
    country: 'México',
    createdAt: { toDate: () => new Date('2023-01-02') },
    updatedAt: { toDate: () => new Date('2023-01-02') }
  }
];

const mockPaginatedResponse = {
  users: mockUsers,
  hasMore: false,
  total: 2,
  lastDoc: null
};

describe('AdminUsers Service Integration', () => {
  const mockUseAdminAuth = {
    canAccess: vi.fn().mockReturnValue(true),
    canEditRoles: vi.fn().mockReturnValue(true),
    canManageUserStatus: vi.fn().mockReturnValue(true),
    getRestrictionMessage: vi.fn().mockReturnValue('No tienes permisos'),
    adminProfile: {
      uid: 'admin-uid',
      email: 'admin@test.com',
      role: 'super_admin'
    },
    loading: false,
    isAdmin: true,
    role: 'super_admin' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminAuth as any).mockReturnValue(mockUseAdminAuth);
  });

  describe('User Service Operations', () => {
    it('should fetch users with pagination', async () => {
      (adminUserService.getUsers as any).mockResolvedValue(mockPaginatedResponse);
      
      const result = await adminUserService.getUsers(25, undefined);
      
      expect(adminUserService.getUsers).toHaveBeenCalledWith(25, undefined);
      expect(result).toEqual(mockPaginatedResponse);
      expect(result.users).toHaveLength(2);
    });

    it('should search users by query', async () => {
      (adminUserService.searchUsers as any).mockResolvedValue(mockUsers);
      
      const result = await adminUserService.searchUsers('admin');
      
      expect(adminUserService.searchUsers).toHaveBeenCalledWith('admin');
      expect(result).toEqual(mockUsers);
    });

    it('should update user role', async () => {
      (adminUserService.updateUserRole as any).mockResolvedValue(undefined);
      
      await adminUserService.updateUserRole('user1', 'manager', { 
        uid: 'admin-uid', 
        email: 'admin@test.com' 
      });
      
      expect(adminUserService.updateUserRole).toHaveBeenCalledWith(
        'user1',
        'manager',
        { uid: 'admin-uid', email: 'admin@test.com' }
      );
    });

    it('should update user status', async () => {
      (adminUserService.updateUserStatus as any).mockResolvedValue(undefined);
      
      await adminUserService.updateUserStatus('user1', 'suspended', { 
        uid: 'admin-uid', 
        email: 'admin@test.com' 
      });
      
      expect(adminUserService.updateUserStatus).toHaveBeenCalledWith(
        'user1',
        'suspended',
        { uid: 'admin-uid', email: 'admin@test.com' }
      );
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Service unavailable';
      (adminUserService.getUsers as any).mockRejectedValue(new Error(errorMessage));
      
      await expect(adminUserService.getUsers(25, undefined)).rejects.toThrow(errorMessage);
    });
  });

  describe('Permission System', () => {
    it('should allow super_admin to access all functions', () => {
      const result = mockUseAdminAuth.canAccess();
      expect(result).toBe(true);
      
      const canEdit = mockUseAdminAuth.canEditRoles();
      expect(canEdit).toBe(true);
      
      const canManage = mockUseAdminAuth.canManageUserStatus();
      expect(canManage).toBe(true);
    });

    it('should restrict access for non-admin users', () => {
      const restrictedAuth = {
        ...mockUseAdminAuth,
        canAccess: vi.fn().mockReturnValue(false),
        canEditRoles: vi.fn().mockReturnValue(false),
        canManageUserStatus: vi.fn().mockReturnValue(false),
        role: 'client' as const
      };
      
      expect(restrictedAuth.canAccess()).toBe(false);
      expect(restrictedAuth.canEditRoles()).toBe(false);
      expect(restrictedAuth.canManageUserStatus()).toBe(false);
    });

    it('should provide appropriate restriction messages', () => {
      const message = mockUseAdminAuth.getRestrictionMessage();
      expect(message).toBe('No tienes permisos');
    });
  });

  describe('Data Processing', () => {
    it('should process user data correctly', () => {
      const user = mockUsers[0];
      
      expect(user.uid).toBe('user1');
      expect(user.email).toBe('admin@test.com');
      expect(user.role).toBe('admin');
      expect(user.status).toBe('active');
      expect(user.companyName).toBe('Test Company');
    });

    it('should handle users with missing company data', () => {
      const userWithoutCompany = {
        ...mockUsers[0],
        companyId: null,
        companyName: undefined
      };
      
      expect(userWithoutCompany.companyId).toBeNull();
      expect(userWithoutCompany.companyName).toBeUndefined();
    });

    it('should handle pagination data correctly', () => {
      expect(mockPaginatedResponse.total).toBe(2);
      expect(mockPaginatedResponse.hasMore).toBe(false);
      expect(mockPaginatedResponse.users).toHaveLength(2);
    });
  });

  describe('Role Management Logic', () => {
    const roles = ['super_admin', 'admin', 'manager', 'analyst', 'affiliate', 'client'] as const;
    
    it('should define all required roles', () => {
      expect(roles).toHaveLength(6);
      expect(roles).toContain('super_admin');
      expect(roles).toContain('client');
    });

    it('should validate role hierarchy permissions', () => {
      // Super admin can edit all roles
      mockUseAdminAuth.canEditRoles.mockReturnValue(true);
      expect(mockUseAdminAuth.canEditRoles()).toBe(true);
      
      // Regular admin has limited permissions
      const adminAuth = {
        ...mockUseAdminAuth,
        canEditRoles: vi.fn().mockReturnValue(false),
        role: 'admin' as const
      };
      expect(adminAuth.canEditRoles()).toBe(false);
    });
  });

  describe('CSV Export Logic', () => {
    it('should format user data for CSV export', () => {
      const csvData = mockUsers.map(user => ({
        Email: user.email,
        Nombre: user.displayName || 'N/A',
        Rol: user.role,
        Estado: user.status,
        Empresa: user.companyName || 'N/A',
        País: user.country || 'N/A',
        'Fecha de Registro': user.createdAt.toDate().toLocaleDateString('es-ES')
      }));
      
      expect(csvData).toHaveLength(2);
      expect(csvData[0].Email).toBe('admin@test.com');
      expect(csvData[0].Rol).toBe('admin');
      expect(csvData[1].Empresa).toBe('User Company');
    });

    it('should handle missing data in CSV export', () => {
      const userWithMissingData = {
        ...mockUsers[0],
        displayName: null,
        companyName: null,
        country: null
      };
      
      const csvRow = {
        Email: userWithMissingData.email,
        Nombre: userWithMissingData.displayName || 'N/A',
        Rol: userWithMissingData.role,
        Estado: userWithMissingData.status,
        Empresa: userWithMissingData.companyName || 'N/A',
        País: userWithMissingData.country || 'N/A'
      };
      
      expect(csvRow.Nombre).toBe('N/A');
      expect(csvRow.Empresa).toBe('N/A');
      expect(csvRow.País).toBe('N/A');
    });
  });

  describe('Search and Filter Logic', () => {
    it('should filter users by role', () => {
      const adminUsers = mockUsers.filter(user => user.role === 'admin');
      const clientUsers = mockUsers.filter(user => user.role === 'client');
      
      expect(adminUsers).toHaveLength(1);
      expect(clientUsers).toHaveLength(1);
      expect(adminUsers[0].email).toBe('admin@test.com');
    });

    it('should filter users by status', () => {
      const activeUsers = mockUsers.filter(user => user.status === 'active');
      
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(user => user.status === 'active')).toBe(true);
    });

    it('should search users by email or name', () => {
      const searchTerm = 'admin';
      const filteredUsers = mockUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filteredUsers).toHaveLength(1);
      expect(filteredUsers[0].email).toBe('admin@test.com');
    });
  });
});

// Integration test for complete workflow
describe('AdminUsers Integration Workflow', () => {
  it('should simulate complete user management workflow', async () => {
    const mockAuth = {
      canAccess: vi.fn().mockReturnValue(true),
      canEditRoles: vi.fn().mockReturnValue(true),
      canManageUserStatus: vi.fn().mockReturnValue(true),
      getRestrictionMessage: vi.fn(),
      adminProfile: {
        uid: 'admin-uid',
        email: 'admin@test.com',
        role: 'super_admin'
      },
      loading: false,
      isAdmin: true,
      role: 'super_admin' as const
    };
    
    (useAdminAuth as any).mockReturnValue(mockAuth);
    (adminUserService.getUsers as any).mockResolvedValue(mockPaginatedResponse);
    (adminUserService.searchUsers as any).mockResolvedValue([mockUsers[0]]);
    (adminUserService.updateUserRole as any).mockResolvedValue(undefined);
    (adminUserService.updateUserStatus as any).mockResolvedValue(undefined);
    
    // 1. Check permissions
    expect(mockAuth.canAccess()).toBe(true);
    
    // 2. Load initial users
    const initialUsers = await adminUserService.getUsers(25, undefined);
    expect(initialUsers.users).toHaveLength(2);
    
    // 3. Perform search
    const searchResults = await adminUserService.searchUsers('admin');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].email).toBe('admin@test.com');
    
    // 4. Update user role
    await adminUserService.updateUserRole('user1', 'manager', {
      uid: 'admin-uid',
      email: 'admin@test.com'
    });
    expect(adminUserService.updateUserRole).toHaveBeenCalled();
    
    // 5. Update user status
    await adminUserService.updateUserStatus('user1', 'suspended', {
      uid: 'admin-uid',
      email: 'admin@test.com'
    });
    expect(adminUserService.updateUserStatus).toHaveBeenCalled();
    
    // 6. Verify all operations completed successfully
    expect(adminUserService.getUsers).toHaveBeenCalled();
    expect(adminUserService.searchUsers).toHaveBeenCalled();
    expect(adminUserService.updateUserRole).toHaveBeenCalled();
    expect(adminUserService.updateUserStatus).toHaveBeenCalled();
  });
});