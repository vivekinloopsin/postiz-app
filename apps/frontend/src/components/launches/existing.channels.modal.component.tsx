'use client';

import { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useRouter } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

interface Location {
    id: string;
    name: string;
    picture: { data: { url: string } };
    accountName: string;
    locationName: string;
}

interface SavedAccount {
    rootId: string;
    name: string;
    picture: string;
    locations: Location[];
    token: string;
    refreshToken: string;
}

export const ExistingChannelsModal: FC<{
    accounts: SavedAccount[];
    update?: () => void;
}> = ({ accounts, update }) => {
    const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedAccount || !selectedLocation) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/gmb/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    locationId: selectedLocation,
                    accessToken: selectedAccount.token,
                    refreshToken: selectedAccount.refreshToken,
                }),
            });

            modal.closeAll();
            router.refresh();
            if (update) update();
            toaster.show('Location added successfully', 'success');
        } catch (error) {
            toaster.show('Failed to add location', 'warning');
        } finally {
            setLoading(false);
        }
    }, [selectedAccount, selectedLocation]);

    if (accounts.length === 0) {
        return (
            <div className="p-[20px] text-center">
                <p>No saved Google Business accounts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add a Google My Business channel first to save your account.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            {/* Account Selection */}
            <div>
                <h3 className="mb-[10px] font-semibold">Select Google Account</h3>
                <div className="grid grid-cols-2 gap-[10px]">
                    {accounts.map((account) => (
                        <div
                            key={account.rootId}
                            onClick={() => {
                                setSelectedAccount(account);
                                setSelectedLocation(null);
                            }}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedAccount?.rootId === account.rootId
                                    ? 'border-primary bg-primary/10'
                                    : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={account.picture || '/no-picture.jpg'}
                                    className="w-[40px] h-[40px] rounded-full"
                                    alt={account.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{account.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {account.locations.length} location(s)
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Location Selection */}
            {selectedAccount && (
                <div>
                    <h3 className="mb-[10px] font-semibold">Select Business Location</h3>
                    <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                        {selectedAccount.locations.map((location) => (
                            <div
                                key={location.id}
                                onClick={() => setSelectedLocation(location.id)}
                                className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedLocation === location.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-center gap-[10px]">
                                    <img
                                        src={location.picture.data.url || '/no-picture.jpg'}
                                        className="w-[36px] h-[36px] rounded-[8px]"
                                        alt={location.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{location.name}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Connect Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleConnect}
                    disabled={!selectedLocation || loading}
                >
                    {loading ? 'Connecting...' : 'Connect Location'}
                </Button>
            </div>
        </div>
    );
};
