import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  addDoc,
  Timestamp,
  getDoc,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Type definitions

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'analyst' | 'affiliate' | 'client';
  status: 'active' | 'suspended' | 'pending';
  companyId?: string;
  companyName?: string;
  country?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLogin?: Timestamp;
  isEmailVerified?: boolean;
}

export interface AdminCompany {
  id: string;
  name: string;
  type: string;
  country: string;
  status: string;
  createdAt: Timestamp;
  usersCount: number;
}

export interface AdminAction {
  id?: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: any;
  metadata?: Record<string, any>;
}

export interface PaginatedUsers {
  users: AdminUser[];
  lastDoc?: QueryDocumentSnapshot;
  hasMore: boolean;
  total: number;
}

export const adminUserService = {
  // Obtener usuarios con paginación mejorada
  async getUsers(limitCount: number = 25, lastDocument?: DocumentSnapshot): Promise<PaginatedUsers> {
    try {
      console.log('🔍 Loading users with pagination...', { limitCount });
      
      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const snapshot = await getDocs(q);
      const users: AdminUser[] = [];

      // Obtener IDs de empresas para cargar sus nombres
      const companyIds = new Set<string>();

      snapshot.forEach((doc) => {
        const userData = doc.data();
        const user: AdminUser = {
          uid: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || '',
          photoURL: userData.photoURL || '',
          role: userData.role || 'client',
          status: userData.status || 'active',
          companyId: userData.companyId || '',
          country: userData.country || '',
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
          lastLogin: userData.lastLogin || null,
          isEmailVerified: userData.emailVerified || false
        };
        
        if (user.companyId) {
          companyIds.add(user.companyId);
        }
        
        users.push(user);
      });

      // Cargar nombres de empresas
      const companies = await this.getCompaniesMap(Array.from(companyIds));
      users.forEach(user => {
        if (user.companyId && companies[user.companyId]) {
          user.companyName = companies[user.companyId];
        }
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === limitCount;

      console.log('✅ Users loaded successfully', { count: users.length, hasMore });

      return {
        users,
        lastDoc,
        hasMore,
        total: users.length
      };
    } catch (error) {
      console.error('❌ Error loading users:', error);
      throw new Error('Error al cargar usuarios');
    }
  },

  // Buscar usuarios mejorado
  async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    try {
      console.log('🔍 Searching users...', { searchTerm });
      
      const normalizedTerm = searchTerm.toLowerCase().trim();
      const users: AdminUser[] = [];
      const usersMap = new Map<string, AdminUser>();

      // Buscar por email
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '>=', normalizedTerm),
        where('email', '<=', normalizedTerm + '\uf8ff'),
        orderBy('email'),
        limit(50)
      );

      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach((doc) => {
        const userData = doc.data();
        const user: AdminUser = {
          uid: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || '',
          photoURL: userData.photoURL || '',
          role: userData.role || 'client',
          status: userData.status || 'active',
          companyId: userData.companyId || '',
          country: userData.country || '',
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
          lastLogin: userData.lastLogin || null,
          isEmailVerified: userData.emailVerified || false
        };
        usersMap.set(doc.id, user);
      });

      // Buscar por displayName si no es email
      if (!searchTerm.includes('@')) {
        try {
          const nameQuery = query(
            collection(db, 'users'),
            where('displayName', '>=', searchTerm),
            where('displayName', '<=', searchTerm + '\uf8ff'),
            orderBy('displayName'),
            limit(50)
          );

          const nameSnapshot = await getDocs(nameQuery);
          nameSnapshot.forEach((doc) => {
            if (!usersMap.has(doc.id)) {
              const userData = doc.data();
              const user: AdminUser = {
                uid: doc.id,
                email: userData.email || '',
                displayName: userData.displayName || userData.name || '',
                photoURL: userData.photoURL || '',
                role: userData.role || 'client',
                status: userData.status || 'active',
                companyId: userData.companyId || '',
                country: userData.country || '',
                createdAt: userData.createdAt || null,
                updatedAt: userData.updatedAt || null,
                lastLogin: userData.lastLogin || null,
                isEmailVerified: userData.emailVerified || false
              };
              usersMap.set(doc.id, user);
            }
          });
        } catch (nameError) {
          console.warn('Name search failed (index may not exist):', nameError);
        }
      }

      const foundUsers = Array.from(usersMap.values());

      // Enriquecer con datos de empresas
      const companyIds = foundUsers.map(u => u.companyId).filter(Boolean) as string[];
      const companies = await this.getCompaniesMap(companyIds);
      
      foundUsers.forEach(user => {
        if (user.companyId && companies[user.companyId]) {
          user.companyName = companies[user.companyId];
        }
      });

      console.log('✅ Search completed', { searchTerm, results: foundUsers.length });
      return foundUsers;
    } catch (error) {
      console.error('❌ Error searching users:', error);
      throw new Error('Error al buscar usuarios');
    }
  },

  // Actualizar rol con logging
  async updateUserRole(userId: string, newRole: string, adminUser?: { uid: string; email: string }): Promise<void> {
    try {
      console.log('🔄 Updating user role...', { userId, newRole });
      
      // Obtener datos actuales del usuario
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const currentUser = userDoc.data() as AdminUser;
      const oldRole = currentUser.role;

      // Actualizar rol
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });

      // Registrar acción en logs si se proporciona admin
      if (adminUser) {
        await this.logAdminAction({
          adminUid: adminUser.uid,
          adminEmail: adminUser.email,
          action: 'update_user_role',
          targetUserId: userId,
          targetUserEmail: currentUser.email,
          oldValue: oldRole,
          newValue: newRole,
          timestamp: serverTimestamp(),
          metadata: {
            userDisplayName: currentUser.displayName
          }
        });
      }

      console.log('✅ User role updated successfully');
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw new Error('Error al actualizar rol del usuario');
    }
  },

  // Actualizar estado con logging
  async updateUserStatus(userId: string, newStatus: string, adminUser?: { uid: string; email: string }): Promise<void> {
    try {
      console.log('🔄 Updating user status...', { userId, newStatus });
      
      // Obtener datos actuales del usuario
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const currentUser = userDoc.data() as AdminUser;
      const oldStatus = currentUser.status;

      // Actualizar estado
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Registrar acción en logs si se proporciona admin
      if (adminUser) {
        await this.logAdminAction({
          adminUid: adminUser.uid,
          adminEmail: adminUser.email,
          action: 'update_user_status',
          targetUserId: userId,
          targetUserEmail: currentUser.email,
          oldValue: oldStatus,
          newValue: newStatus,
          timestamp: serverTimestamp(),
          metadata: {
            userDisplayName: currentUser.displayName
          }
        });
      }

      console.log('✅ User status updated successfully');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw new Error('Error al actualizar estado del usuario');
    }
  },

  // Obtener usuario específico (sin cambios)
  async getUser(userId: string): Promise<AdminUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        email: userData.email || '',
        displayName: userData.displayName || userData.name || '',
        photoURL: userData.photoURL || '',
        role: userData.role || 'client',
        status: userData.status || 'active',
        companyId: userData.companyId || '',
        country: userData.country || '',
        createdAt: userData.createdAt || null,
        updatedAt: userData.updatedAt || null,
        lastLogin: userData.lastLogin || null,
        isEmailVerified: userData.emailVerified || false
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Método para registrar acciones administrativas
  async logAdminAction(action: AdminAction): Promise<void> {
    try {
      await addDoc(collection(db, 'admin_actions'), action);
      console.log('📝 Admin action logged:', action.action);
    } catch (error) {
      console.error('❌ Error logging admin action:', error);
      // No fallar la operación principal si falla el log
    }
  },

  // Método para obtener mapa de empresas
  async getCompaniesMap(companyIds: string[]): Promise<Record<string, string>> {
    if (companyIds.length === 0) return {};

    try {
      const companiesMap: Record<string, string> = {};
      
      // Cargar empresas en lotes de 10 (límite de Firestore para 'in')
      const chunks = this.chunkArray(companyIds, 10);
      
      for (const chunk of chunks) {
        const companiesQuery = query(
          collection(db, 'companies'),
          where('__name__', 'in', chunk)
        );
        
        const snapshot = await getDocs(companiesQuery);
        snapshot.docs.forEach(doc => {
          const companyData = doc.data();
          companiesMap[doc.id] = companyData.name || companyData.companyName || 'Sin nombre';
        });
      }

      return companiesMap;
    } catch (error) {
      console.error('❌ Error loading companies:', error);
      return {};
    }
  },

  // Método auxiliar para dividir arrays
  chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Obtener estadísticas de usuarios
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    recentRegistrations: number;
  }> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      
      const stats = {
        total: snapshot.size,
        byRole: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        recentRegistrations: 0
      };

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      snapshot.docs.forEach(doc => {
        const user = doc.data() as AdminUser;
        
        // Contar por rol
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
        
        // Contar por estado
        stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
        
        // Contar registros recientes
        if (user.createdAt && user.createdAt.toDate() > oneWeekAgo) {
          stats.recentRegistrations++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }
};

export const adminCompanyService = {
  async getCompanies(limitCount: number = 100): Promise<{ companies: AdminCompany[], total: number }> {
    try {
      const companiesRef = collection(db, 'companies');
      const q = query(
        companiesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const companies: AdminCompany[] = [];

      snapshot.forEach((doc) => {
        const companyData = doc.data();
        companies.push({
          id: doc.id,
          name: companyData.name || '',
          type: companyData.type || '',
          country: companyData.country || '',
          status: companyData.status || 'active',
          createdAt: companyData.createdAt || Timestamp.now(),
          usersCount: companyData.usersCount || 0
        });
      });

      return {
        companies,
        total: companies.length
      };
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  }
};