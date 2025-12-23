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
    const [selectedLocation, setSelectedLocation] = useState<{ locationId: string; account: SavedAccount } | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedLocation) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/gmb/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    locationId: selectedLocation.locationId,
                    accessToken: selectedLocation.account.token,
                    refreshToken: selectedLocation.account.refreshToken,
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
    }, [selectedLocation]);

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

    // Flatten and deduplicate locations
    const allLocationsMap = new Map();

    accounts.forEach(account => {
        account.locations.forEach(location => {
            if (!allLocationsMap.has(location.id)) {
                allLocationsMap.set(location.id, {
                    ...location,
                    account
                });
            }
        });
    });

    const allLocations = Array.from(allLocationsMap.values());

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            {/* Location Selection - Show all locations from all accounts */}
            <div>
                <h3 className="mb-[10px] font-semibold">Select Business Location</h3>
                <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                    {allLocations.map((location) => (
                        <div
                            key={location.id}
                            onClick={() => setSelectedLocation({ locationId: location.id, account: location.account })}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedLocation?.locationId === location.id
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
                                    <div className="text-xs text-gray-500">{location.account.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
