import { useState, useEffect, useCallback } from 'react';
import { agreementService, AgreementStatus, UserAgreement } from '../services/agreementService';
import { useAuth } from '../../../hooks/useAuth';

interface UseAgreementState {
    agreementStatus: AgreementStatus | null;
    loading: boolean;
    error: string | null;
}

interface UseAgreementReturn extends UseAgreementState {
    hasSignedAgreement: (type: UserAgreement['agreementType']) => boolean;
    requiresAgreement: boolean;
    signAgreement: (
        type: UserAgreement['agreementType'],
        data?: { ipAddress?: string; userAgent?: string }
    ) => Promise<void>;
    revokeAgreement: (
        type: UserAgreement['agreementType'],
        reason?: string
    ) => Promise<void>;
    checkForUpdates: () => Promise<{ needsUpdate: boolean; outdatedAgreements: UserAgreement['agreementType'][] }>;
    refreshAgreements: () => Promise<void>;
}

export const useAgreement = (): UseAgreementReturn => {
    const { user } = useAuth();
    const [state, setState] = useState<UseAgreementState>({
        agreementStatus: null,
        loading: false,
        error: null,
    });

    // Update loading state
    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    }, []);

    // Update error state
    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    // Update agreement status
    const setAgreementStatus = useCallback((agreementStatus: AgreementStatus | null) => {
        setState(prev => ({ ...prev, agreementStatus }));
    }, []);

    // Check if user has signed a specific agreement
    const hasSignedAgreement = useCallback((type: UserAgreement['agreementType']): boolean => {
        if (!state.agreementStatus) return false;

        switch (type) {
            case 'terms_of_service':
                return state.agreementStatus.hasSignedTerms;
            case 'privacy_policy':
                return state.agreementStatus.hasSignedPrivacy;
            case 'data_processing':
                return state.agreementStatus.hasSignedDataProcessing;
            case 'marketing':
                return state.agreementStatus.hasSignedMarketing;
            default:
                return false;
        }
    }, [state.agreementStatus]);

    // Check if user needs to sign any required agreements
    const requiresAgreement = useCallback((): boolean => {
        if (!state.agreementStatus) return true;

        // Required agreements for basic usage
        const requiredAgreements: UserAgreement['agreementType'][] = [
            'terms_of_service',
            'privacy_policy',
            'data_processing'
        ];

        return requiredAgreements.some(type => !hasSignedAgreement(type));
    }, [state.agreementStatus, hasSignedAgreement]);

    // Sign an agreement
    const signAgreement = useCallback(async (
        type: UserAgreement['agreementType'],
        data?: { ipAddress?: string; userAgent?: string }
    ): Promise<void> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            setLoading(true);
            setError(null);

            console.log('✍️ Signing agreement via hook...', { uid: user.id, type });

            // Get client information if not provided
            const agreementData = {
                ipAddress: data?.ipAddress || (await getClientIP()),
                userAgent: data?.userAgent || navigator.userAgent,
            };

            await agreementService.signUserAgreement(user.id, type, agreementData);

            console.log('✅ Agreement signed successfully via hook');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign agreement';
            console.error('❌ Error signing agreement via hook:', error);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user?.id, setLoading, setError]);

    // Revoke an agreement
    const revokeAgreement = useCallback(async (
        type: UserAgreement['agreementType'],
        reason?: string
    ): Promise<void> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            setLoading(true);
            setError(null);

            console.log('❌ Revoking agreement via hook...', { uid: user.id, type, reason });
            await agreementService.revokeUserAgreement(user.id, type, reason);

            console.log('✅ Agreement revoked successfully via hook');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to revoke agreement';
            console.error('❌ Error revoking agreement via hook:', error);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user?.id, setLoading, setError]);

    // Check for updated agreements
    const checkForUpdates = useCallback(async (): Promise<{
        needsUpdate: boolean;
        outdatedAgreements: UserAgreement['agreementType'][];
    }> => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            console.log('🔍 Checking for agreement updates via hook...', { uid: user.id });
            const updateInfo = await agreementService.checkForUpdatedAgreements(user.id);

            console.log('✅ Agreement update check completed via hook', updateInfo);
            return updateInfo;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to check for updates';
            console.error('❌ Error checking for agreement updates via hook:', error);
            setError(errorMessage);
            throw error;
        }
    }, [user?.id, setError]);

    // Refresh agreement status manually
    const refreshAgreements = useCallback(async (): Promise<void> => {
        if (!user?.id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Refreshing agreements via hook...', { uid: user.id });
            const status = await agreementService.getUserAgreementStatus(user.id);
            setAgreementStatus(status);

            console.log('✅ Agreements refreshed successfully via hook');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh agreements';
            console.error('❌ Error refreshing agreements via hook:', error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user?.id, setLoading, setError, setAgreementStatus]);

    // Setup real-time listener
    useEffect(() => {
        if (!user?.id) {
            setState({
                agreementStatus: null,
                loading: false,
                error: null,
            });
            return;
        }

        console.log('👂 Setting up agreement listener via hook...', { uid: user.id });
        setLoading(true);
        setError(null);

        // Setup real-time listener
        const unsubscribe = agreementService.listenToAgreementStatus(user.id, (status) => {
            console.log('🔄 Agreement status updated via listener:', status ? 'Status found' : 'Status not found');
            setAgreementStatus(status);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => {
            console.log('🧹 Cleaning up agreement listener...');
            unsubscribe();
        };
    }, [user?.id, setLoading, setError, setAgreementStatus]);

    return {
        agreementStatus: state.agreementStatus,
        loading: state.loading,
        error: state.error,
        hasSignedAgreement,
        requiresAgreement: requiresAgreement(),
        signAgreement,
        revokeAgreement,
        checkForUpdates,
        refreshAgreements,
    };
};

// Helper function to get client IP (simplified version)
async function getClientIP(): Promise<string> {
    try {
        // In a real application, you might use a service to get the IP
        // For now, we'll return a placeholder
        return 'unknown';
    } catch (error) {
        console.warn('Failed to get client IP:', error);
        return 'unknown';
    }
}