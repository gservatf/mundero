import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  status: string;
  companyId?: string;
  country?: string;
  createdAt?: Timestamp;
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

export const adminUserService = {
  // Obtener todos los usuarios de la colección global 'users'
  async getUsers(limitCount: number = 100): Promise<{ users: AdminUser[], total: number }> {
    try {
      // Leer desde la colección global 'users' en lugar de user_profiles
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const users: AdminUser[] = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || '',
          photoURL: userData.photoURL || '',
          role: userData.role || 'client',
          status: userData.status || 'active',
          companyId: userData.companyId || '',
          country: userData.country || '',
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLogin || null,
          isEmailVerified: userData.emailVerified || false
        });
      });

      return {
        users,
        total: users.length
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Buscar usuarios por email o nombre
  async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    try {
      const usersRef = collection(db, 'users');
      
      // Buscar por email
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(50)
      );

      const emailSnapshot = await getDocs(emailQuery);
      const users: AdminUser[] = [];

      emailSnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.name || '',
          photoURL: userData.photoURL || '',
          role: userData.role || 'client',
          status: userData.status || 'active',
          companyId: userData.companyId || '',
          country: userData.country || '',
          createdAt: userData.createdAt || null,
          lastLogin: userData.lastLogin || null,
          isEmailVerified: userData.emailVerified || false
        });
      });

      // También buscar por displayName si es diferente del email
      if (!searchTerm.includes('@')) {
        const nameQuery = query(
          usersRef,
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff'),
          limit(50)
        );

        const nameSnapshot = await getDocs(nameQuery);
        nameSnapshot.forEach((doc) => {
          const userData = doc.data();
          // Evitar duplicados
          if (!users.find(u => u.uid === doc.id)) {
            users.push({
              uid: doc.id,
              email: userData.email || '',
              displayName: userData.displayName || userData.name || '',
              photoURL: userData.photoURL || '',
              role: userData.role || 'client',
              status: userData.status || 'active',
              companyId: userData.companyId || '',
              country: userData.country || '',
              createdAt: userData.createdAt || null,
              lastLogin: userData.lastLogin || null,
              isEmailVerified: userData.emailVerified || false
            });
          }
        });
      }

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Actualizar rol de usuario
  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Actualizar estado de usuario
  async updateUserStatus(userId: string, newStatus: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Obtener usuario específico
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
        lastLogin: userData.lastLogin || null,
        isEmailVerified: userData.emailVerified || false
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
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