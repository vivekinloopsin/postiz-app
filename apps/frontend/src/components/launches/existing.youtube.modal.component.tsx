'use client';

import { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useRouter } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

interface YoutubeChannel {
    id: string;
    name: string;
    username: string;
    picture: string;
}

interface SavedAccount {
    rootId: string;
    name: string;
    picture: string;
    channels: YoutubeChannel[];
    token: string;
    refreshToken: string;
}

export const ExistingYoutubeModal: FC<{
    accounts: SavedAccount[];
    update?: () => void;
}> = ({ accounts, update }) => {
    const [selectedChannel, setSelectedChannel] = useState<{ channel: YoutubeChannel; savedAccount: SavedAccount } | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedChannel) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/youtube/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    channelId: selectedChannel.channel.id,
                    accessToken: selectedChannel.savedAccount.token,
                    refreshToken: selectedChannel.savedAccount.refreshToken,
                }),
            });

            modal.closeAll();
            router.refresh();
            if (update) update();
            toaster.show('YouTube channel added successfully', 'success');
        } catch (error) {
            toaster.show('Failed to add YouTube channel', 'warning');
        } finally {
            setLoading(false);
        }
    }, [selectedChannel]);

    if (accounts.length === 0) {
        return (
            <div className="p-[20px] text-center">
                <p>No saved YouTube accounts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add a YouTube channel first to save your account.
                </p>
            </div>
        );
    }

    const allChannels = accounts.flatMap(savedAccount =>
        savedAccount.channels.map(channel => ({
            ...channel,
            savedAccount,
        }))
    );

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            <div>
                <h3 className="mb-[10px] font-semibold">Select YouTube Channel</h3>
                <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                    {allChannels.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => setSelectedChannel({ channel, savedAccount: channel.savedAccount })}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedChannel?.channel.id === channel.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={channel.picture || '/no-picture.jpg'}
                                    className="w-[36px] h-[36px] rounded-[8px]"
                                    alt={channel.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{channel.name}</div>
                                    <div className="text-xs text-gray-500">{channel.savedAccount.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleConnect}
                    disabled={!selectedChannel || loading}
                >
                    {loading ? 'Connecting...' : 'Connect Channel'}
                </Button>
            </div>
        </div>
    );
};
