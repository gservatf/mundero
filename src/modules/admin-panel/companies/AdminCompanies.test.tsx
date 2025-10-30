import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminCompanyService, AdminCompany } from '../services/adminFirebase';

// Mock Firebase
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    getFirestore: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 })),
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date() }))
    }
  };
});

vi.mock('../../../lib/firebase', () => ({
  db: {}
}));

describe('AdminCompanies Service Integration', () => {
  const mockCompany: AdminCompany = {
    id: 'company-1',
    name: 'Test Company',
    type: 'Technology',
    country: 'Peru',
    status: 'active',
    usersCount: 5,
    apps: ['legality360', 'we-consulting'],
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Company Service Operations', () => {
    it('should create company with proper data structure', async () => {
      const mockDocRef = { id: 'new-company-id' };
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const newCompanyData = {
        name: 'New Tech Company',
        type: 'Technology',
        country: 'Colombia',
        status: 'pending' as const,
        apps: ['analytics-pro']
      };

      const companyId = await adminCompanyService.createCompany(newCompanyData);

      expect(companyId).toBe('new-company-id');
      expect(addDoc).toHaveBeenCalledTimes(1);
      
      // Verify the second argument (data) contains expected fields
      const callArgs = vi.mocked(addDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data).toMatchObject({
        name: 'New Tech Company',
        type: 'Technology',
        country: 'Colombia',
        status: 'pending',
        apps: ['analytics-pro'],
        usersCount: 0,
        nameLower: 'new tech company'
      });
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('should update company with timestamp', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      const updateData = {
        name: 'Updated Company Name',
        type: 'Consulting'
      };

      await adminCompanyService.updateCompany('company-1', updateData);

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data).toMatchObject({
        name: 'Updated Company Name',
        type: 'Consulting',
        nameLower: 'updated company name'
      });
      expect(data).toHaveProperty('updatedAt');
    });

    it('should handle status changes with logging', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      
      // Mock existing company
      const mockDocSnap = {
        exists: () => true,
        data: () => mockCompany
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      const admin = { uid: 'admin-1', email: 'admin@test.com' };
      
      await adminCompanyService.changeCompanyStatus(
        'company-1', 
        'inactive', 
        'Budget constraints',
        admin
      );

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data).toMatchObject({
        status: 'inactive',
        inactiveReason: 'Budget constraints'
      });
      expect(data).toHaveProperty('updatedAt');
    });

    it('should search companies case-insensitive', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      const mockSnapshot = {
        docs: [
          { id: 'comp-1', data: () => ({ ...mockCompany, name: 'Tech Solutions' }) },
          { id: 'comp-2', data: () => ({ ...mockCompany, name: 'Technology Inc' }) }
        ]
      };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const results = await adminCompanyService.searchCompanies('tech');

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Tech Solutions');
      expect(results[1].name).toBe('Technology Inc');
    });

    it('should handle pagination correctly', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      const mockSnapshot = {
        docs: [
          { id: 'comp-1', data: () => mockCompany },
          { id: 'comp-2', data: () => ({ ...mockCompany, name: 'Company 2' }) }
        ]
      };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await adminCompanyService.getCompaniesPaged(2);

      expect(result.companies).toHaveLength(2);
      expect(result.hasMore).toBe(true); // Since we got exactly the limit
      expect(result.lastDoc).toBeDefined();
    });
  });

  describe('App Management', () => {
    it('should link apps without duplicates', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ ...mockCompany, apps: ['legality360'] })
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await adminCompanyService.linkApp('company-1', 'we-consulting');

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data.apps).toEqual(['legality360', 'we-consulting']);
      expect(data).toHaveProperty('updatedAt');
    });

    it('should unlink specific apps', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ ...mockCompany, apps: ['legality360', 'we-consulting', 'analytics-pro'] })
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await adminCompanyService.unlinkApp('company-1', 'we-consulting');

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data.apps).toEqual(['legality360', 'analytics-pro']);
      expect(data).toHaveProperty('updatedAt');
    });

    it('should prevent duplicate app linking', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ ...mockCompany, apps: ['legality360', 'we-consulting'] })
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await adminCompanyService.linkApp('company-1', 'legality360');

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data.apps).toEqual(['legality360', 'we-consulting']); // No duplicates
      expect(data).toHaveProperty('updatedAt');
    });
  });

  describe('Error Handling', () => {
    it('should handle company not found gracefully', async () => {
      const { getDoc } = await import('firebase/firestore');
      
      const mockDocSnap = {
        exists: () => false
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      await expect(
        adminCompanyService.changeCompanyStatus('non-existent', 'active')
      ).rejects.toThrow('Error al cambiar estado de empresa');
    });

    it('should handle Firebase errors in search', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Firebase error'));

      await expect(
        adminCompanyService.searchCompanies('test')
      ).rejects.toThrow('Error al buscar empresas');
    });

    it('should handle pagination errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Network error'));

      await expect(
        adminCompanyService.getCompaniesPaged(10)
      ).rejects.toThrow('Error al cargar empresas');
    });
  });

  describe('Data Validation', () => {
    it('should create company with minimal required data', async () => {
      const mockDocRef = { id: 'minimal-company' };
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const companyId = await adminCompanyService.createCompany({
        name: 'Minimal Company'
      });

      expect(companyId).toBe('minimal-company');
      expect(addDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(addDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data).toMatchObject({
        name: 'Minimal Company',
        type: '',
        country: '',
        status: 'pending',
        apps: [],
        usersCount: 0,
        nameLower: 'minimal company'
      });
    });

    it('should handle empty search terms', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      const mockSnapshot = { docs: [] };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const results = await adminCompanyService.searchCompanies('   ');
      expect(results).toHaveLength(0);
    });

    it('should preserve existing data during status change', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      
      const existingCompany = { 
        ...mockCompany, 
        apps: ['custom-app'],
        customField: 'preserve-me'
      };
      
      const mockDocSnap = {
        exists: () => true,
        data: () => existingCompany
      };
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await adminCompanyService.changeCompanyStatus('company-1', 'active');

      expect(updateDoc).toHaveBeenCalledTimes(1);
      
      const callArgs = vi.mocked(updateDoc).mock.calls[0];
      const data = callArgs[1];
      expect(data).toMatchObject({
        status: 'active',
        inactiveReason: null
      });
      expect(data).toHaveProperty('updatedAt');
    });
  });
});

describe('AdminCompanies Integration Workflow', () => {
  it('should simulate complete company management workflow', async () => {
    // Mock all Firebase operations
    const mockDocRef = { id: 'workflow-company' };
    const { addDoc, getDoc, updateDoc, getDocs } = await import('firebase/firestore');
    
    vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
    
    const mockDocSnap = {
      exists: () => true,
      data: () => ({
        id: 'workflow-company',
        name: 'Workflow Company',
        status: 'pending',
        apps: []
      })
    };
    vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined as any);
    
    const mockSearchSnapshot = {
      docs: [{ id: 'workflow-company', data: () => mockDocSnap.data() }]
    };
    vi.mocked(getDocs).mockResolvedValue(mockSearchSnapshot as any);

    // 1. Create company
    const companyId = await adminCompanyService.createCompany({
      name: 'Workflow Company',
      type: 'Technology',
      country: 'Peru'
    });
    expect(companyId).toBe('workflow-company');

    // 2. Search for company
    const searchResults = await adminCompanyService.searchCompanies('Workflow');
    expect(searchResults).toHaveLength(1);

    // 3. Link an app
    await adminCompanyService.linkApp(companyId, 'legality360');
    expect(updateDoc).toHaveBeenCalled();

    // 4. Change status to active
    await adminCompanyService.changeCompanyStatus(companyId, 'active');
    
    // Verify status change call
    const statusCallArgs = vi.mocked(updateDoc).mock.calls.find(call => 
      call[1] && typeof call[1] === 'object' && 'status' in call[1]
    );
    expect(statusCallArgs).toBeDefined();
    expect(statusCallArgs![1]).toMatchObject({ status: 'active' });

    // 5. Update company info
    await adminCompanyService.updateCompany(companyId, {
      type: 'Consulting'
    });
    
    // Verify update call
    const updateCallArgs = vi.mocked(updateDoc).mock.calls.find(call => 
      call[1] && typeof call[1] === 'object' && 'type' in call[1]
    );
    expect(updateCallArgs).toBeDefined();
    expect(updateCallArgs![1]).toMatchObject({ type: 'Consulting' });
  });
});