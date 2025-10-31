import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    FieldValue
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Types for user profile
export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
    location?: string;
    website?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    isPublic: boolean;
    preferences: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        dataSharing: boolean;
    };
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}

export const profileService = {
    /**
     * Get user profile by UID
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            console.log('🔍 Loading user profile...', { uid });

            const userRef = doc(db, 'user_profiles', uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.log('📝 User profile not found');
                return null;
            }

            const data = userDoc.data();
            const profile: UserProfile = {
                uid: userDoc.id,
                email: data.email || '',
                displayName: data.displayName || '',
                photoURL: data.photoURL || '',
                bio: data.bio || '',
                location: data.location || '',
                website: data.website || '',
                phoneNumber: data.phoneNumber || '',
                dateOfBirth: data.dateOfBirth?.toDate() || undefined,
                isPublic: data.isPublic || false,
                preferences: {
                    emailNotifications: data.preferences?.emailNotifications ?? true,
                    pushNotifications: data.preferences?.pushNotifications ?? true,
                    dataSharing: data.preferences?.dataSharing ?? false,
                },
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };

            console.log('✅ User profile loaded successfully');
            return profile;
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
            throw new Error('Failed to load user profile');
        }
    },

    /**
     * Update user profile
     */
    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            console.log('🔄 Updating user profile...', { uid, data });

            const userRef = doc(db, 'user_profiles', uid);

            // Prepare update data with timestamp
            const updateData = {
                ...data,
                updatedAt: serverTimestamp(),
            };

            // Convert Date objects to Timestamp if needed
            if (data.dateOfBirth instanceof Date) {
                (updateData as any).dateOfBirth = Timestamp.fromDate(data.dateOfBirth);
            }

            await updateDoc(userRef, updateData);

            console.log('✅ User profile updated successfully');
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw new Error('Failed to update user profile');
        }
    },

    /**
     * Create initial user profile
     */
    async createUserProfile(uid: string, initialData: Partial<UserProfile>): Promise<void> {
        try {
            console.log('🆕 Creating user profile...', { uid });

            const userRef = doc(db, 'user_profiles', uid);

            const profileData: UserProfile = {
                uid,
                email: initialData.email || '',
                displayName: initialData.displayName || '',
                photoURL: initialData.photoURL || '',
                bio: initialData.bio || '',
                location: initialData.location || '',
                website: initialData.website || '',
                phoneNumber: initialData.phoneNumber || '',
                dateOfBirth: initialData.dateOfBirth,
                isPublic: initialData.isPublic || false,
                preferences: {
                    emailNotifications: initialData.preferences?.emailNotifications ?? true,
                    pushNotifications: initialData.preferences?.pushNotifications ?? true,
                    dataSharing: initialData.preferences?.dataSharing ?? false,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, profileData);

            console.log('✅ User profile created successfully');
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            throw new Error('Failed to create user profile');
        }
    },

    /**
     * Listen to user profile changes in real-time
     */
    listenToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
        console.log('👂 Setting up profile listener...', { uid });

        const userRef = doc(db, 'user_profiles', uid);

        const unsubscribe = onSnapshot(
            userRef,
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const profile: UserProfile = {
                        uid: doc.id,
                        email: data.email || '',
                        displayName: data.displayName || '',
                        photoURL: data.photoURL || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        website: data.website || '',
                        phoneNumber: data.phoneNumber || '',
                        dateOfBirth: data.dateOfBirth?.toDate() || undefined,
                        isPublic: data.isPublic || false,
                        preferences: {
                            emailNotifications: data.preferences?.emailNotifications ?? true,
                            pushNotifications: data.preferences?.pushNotifications ?? true,
                            dataSharing: data.preferences?.dataSharing ?? false,
                        },
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    };

                    console.log('🔄 Profile updated via listener');
                    callback(profile);
                } else {
                    console.log('📝 Profile not found via listener');
                    callback(null);
                }
            },
            (error) => {
                console.error('❌ Profile listener error:', error);
                callback(null);
            }
        );

        return unsubscribe;
    },

    /**
     * Check if user profile exists
     */
    async profileExists(uid: string): Promise<boolean> {
        try {
            const userRef = doc(db, 'user_profiles', uid);
            const userDoc = await getDoc(userRef);
            return userDoc.exists();
        } catch (error) {
            console.error('❌ Error checking profile existence:', error);
            return false;
        }
    },
};