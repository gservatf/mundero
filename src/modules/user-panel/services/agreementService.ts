import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    FieldValue
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Types for user agreements
export interface UserAgreement {
    uid: string;
    agreementVersion: string;
    signedAt: Timestamp | FieldValue;
    ipAddress?: string;
    userAgent?: string;
    status: 'signed' | 'pending' | 'revoked';
    agreementType: 'terms_of_service' | 'privacy_policy' | 'data_processing' | 'marketing';
    metadata?: {
        previousVersions?: string[];
        revokedAt?: Timestamp;
        revokedReason?: string;
    };
}

export interface AgreementStatus {
    uid: string;
    hasSignedTerms: boolean;
    hasSignedPrivacy: boolean;
    hasSignedDataProcessing: boolean;
    hasSignedMarketing: boolean;
    lastUpdated: Timestamp | FieldValue;
    currentVersions: {
        terms: string;
        privacy: string;
        dataProcessing: string;
        marketing: string;
    };
}

// Current agreement versions (would typically come from config)
const CURRENT_AGREEMENT_VERSIONS = {
    terms_of_service: '2.1.0',
    privacy_policy: '2.1.0',
    data_processing: '2.1.0',
    marketing: '1.0.0',
};

export const agreementService = {
    /**
     * Get user agreement status for all agreement types
     */
    async getUserAgreementStatus(uid: string): Promise<AgreementStatus | null> {
        try {
            console.log('🔍 Loading user agreement status...', { uid });

            const statusRef = doc(db, 'user_agreement_status', uid);
            const statusDoc = await getDoc(statusRef);

            if (!statusDoc.exists()) {
                console.log('📝 Agreement status not found, creating default');

                // Create default status
                const defaultStatus: AgreementStatus = {
                    uid,
                    hasSignedTerms: false,
                    hasSignedPrivacy: false,
                    hasSignedDataProcessing: false,
                    hasSignedMarketing: false,
                    lastUpdated: serverTimestamp(),
                    currentVersions: {
                        terms: CURRENT_AGREEMENT_VERSIONS.terms_of_service,
                        privacy: CURRENT_AGREEMENT_VERSIONS.privacy_policy,
                        dataProcessing: CURRENT_AGREEMENT_VERSIONS.data_processing,
                        marketing: CURRENT_AGREEMENT_VERSIONS.marketing,
                    },
                };

                await setDoc(statusRef, defaultStatus);
                return defaultStatus;
            }

            const data = statusDoc.data();
            const status: AgreementStatus = {
                uid: statusDoc.id,
                hasSignedTerms: data.hasSignedTerms || false,
                hasSignedPrivacy: data.hasSignedPrivacy || false,
                hasSignedDataProcessing: data.hasSignedDataProcessing || false,
                hasSignedMarketing: data.hasSignedMarketing || false,
                lastUpdated: data.lastUpdated,
                currentVersions: data.currentVersions || {
                    terms: CURRENT_AGREEMENT_VERSIONS.terms_of_service,
                    privacy: CURRENT_AGREEMENT_VERSIONS.privacy_policy,
                    dataProcessing: CURRENT_AGREEMENT_VERSIONS.data_processing,
                    marketing: CURRENT_AGREEMENT_VERSIONS.marketing,
                },
            };

            console.log('✅ Agreement status loaded successfully');
            return status;
        } catch (error) {
            console.error('❌ Error loading agreement status:', error);
            throw new Error('Failed to load agreement status');
        }
    },

    /**
     * Sign a specific user agreement
     */
    async signUserAgreement(
        uid: string,
        agreementType: UserAgreement['agreementType'],
        data?: {
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<void> {
        try {
            console.log('✍️ Signing user agreement...', { uid, agreementType });

            // Create agreement record
            const agreementRef = doc(db, 'user_agreements', `${uid}_${agreementType}_${Date.now()}`);
            const agreement: UserAgreement = {
                uid,
                agreementVersion: CURRENT_AGREEMENT_VERSIONS[agreementType],
                signedAt: serverTimestamp(),
                ipAddress: data?.ipAddress,
                userAgent: data?.userAgent,
                status: 'signed',
                agreementType,
                metadata: {
                    previousVersions: [],
                },
            };

            await setDoc(agreementRef, agreement);

            // Update status document
            const statusRef = doc(db, 'user_agreement_status', uid);
            const statusField = this.getStatusFieldName(agreementType);

            await setDoc(statusRef, {
                uid,
                [statusField]: true,
                lastUpdated: serverTimestamp(),
                [`currentVersions.${this.getVersionFieldName(agreementType)}`]: CURRENT_AGREEMENT_VERSIONS[agreementType],
            }, { merge: true });

            console.log('✅ Agreement signed successfully');
        } catch (error) {
            console.error('❌ Error signing agreement:', error);
            throw new Error('Failed to sign agreement');
        }
    },

    /**
     * Revoke a user agreement
     */
    async revokeUserAgreement(
        uid: string,
        agreementType: UserAgreement['agreementType'],
        reason?: string
    ): Promise<void> {
        try {
            console.log('❌ Revoking user agreement...', { uid, agreementType, reason });

            // Update status document
            const statusRef = doc(db, 'user_agreement_status', uid);
            const statusField = this.getStatusFieldName(agreementType);

            await setDoc(statusRef, {
                uid,
                [statusField]: false,
                lastUpdated: serverTimestamp(),
                [`metadata.${agreementType}_revokedAt`]: serverTimestamp(),
                [`metadata.${agreementType}_revokedReason`]: reason || 'User requested',
            }, { merge: true });

            console.log('✅ Agreement revoked successfully');
        } catch (error) {
            console.error('❌ Error revoking agreement:', error);
            throw new Error('Failed to revoke agreement');
        }
    },

    /**
     * Listen to user agreement status changes in real-time
     */
    listenToAgreementStatus(uid: string, callback: (status: AgreementStatus | null) => void): () => void {
        console.log('👂 Setting up agreement status listener...', { uid });

        const statusRef = doc(db, 'user_agreement_status', uid);

        const unsubscribe = onSnapshot(
            statusRef,
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const status: AgreementStatus = {
                        uid: doc.id,
                        hasSignedTerms: data.hasSignedTerms || false,
                        hasSignedPrivacy: data.hasSignedPrivacy || false,
                        hasSignedDataProcessing: data.hasSignedDataProcessing || false,
                        hasSignedMarketing: data.hasSignedMarketing || false,
                        lastUpdated: data.lastUpdated,
                        currentVersions: data.currentVersions || {
                            terms: CURRENT_AGREEMENT_VERSIONS.terms_of_service,
                            privacy: CURRENT_AGREEMENT_VERSIONS.privacy_policy,
                            dataProcessing: CURRENT_AGREEMENT_VERSIONS.data_processing,
                            marketing: CURRENT_AGREEMENT_VERSIONS.marketing,
                        },
                    };

                    console.log('🔄 Agreement status updated via listener');
                    callback(status);
                } else {
                    console.log('📝 Agreement status not found via listener');
                    callback(null);
                }
            },
            (error) => {
                console.error('❌ Agreement status listener error:', error);
                callback(null);
            }
        );

        return unsubscribe;
    },

    /**
     * Check if user needs to sign updated agreements
     */
    async checkForUpdatedAgreements(uid: string): Promise<{
        needsUpdate: boolean;
        outdatedAgreements: UserAgreement['agreementType'][];
    }> {
        try {
            const status = await this.getUserAgreementStatus(uid);
            if (!status) {
                return {
                    needsUpdate: true,
                    outdatedAgreements: ['terms_of_service', 'privacy_policy', 'data_processing']
                };
            }

            const outdatedAgreements: UserAgreement['agreementType'][] = [];

            // Check each agreement type
            if (!status.hasSignedTerms || status.currentVersions.terms !== CURRENT_AGREEMENT_VERSIONS.terms_of_service) {
                outdatedAgreements.push('terms_of_service');
            }
            if (!status.hasSignedPrivacy || status.currentVersions.privacy !== CURRENT_AGREEMENT_VERSIONS.privacy_policy) {
                outdatedAgreements.push('privacy_policy');
            }
            if (!status.hasSignedDataProcessing || status.currentVersions.dataProcessing !== CURRENT_AGREEMENT_VERSIONS.data_processing) {
                outdatedAgreements.push('data_processing');
            }

            return {
                needsUpdate: outdatedAgreements.length > 0,
                outdatedAgreements
            };
        } catch (error) {
            console.error('❌ Error checking for agreement updates:', error);
            throw new Error('Failed to check agreement updates');
        }
    },

    /**
     * Helper method to get status field name
     */
    getStatusFieldName(agreementType: UserAgreement['agreementType']): string {
        const fieldMap = {
            'terms_of_service': 'hasSignedTerms',
            'privacy_policy': 'hasSignedPrivacy',
            'data_processing': 'hasSignedDataProcessing',
            'marketing': 'hasSignedMarketing',
        };
        return fieldMap[agreementType];
    },

    /**
     * Helper method to get version field name
     */
    getVersionFieldName(agreementType: UserAgreement['agreementType']): string {
        const fieldMap = {
            'terms_of_service': 'terms',
            'privacy_policy': 'privacy',
            'data_processing': 'dataProcessing',
            'marketing': 'marketing',
        };
        return fieldMap[agreementType];
    },
};