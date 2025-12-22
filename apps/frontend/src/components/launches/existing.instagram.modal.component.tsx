'use client';

import { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useRouter } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

interface InstagramAccount {
    id: string;
    pageId: string;
    name: string;
    username: string;
    picture: { data: { url: string } };
}

interface SavedAccount {
    rootId: string;
    name: string;
    picture: string;
    pages: InstagramAccount[];
    token: string;
    refreshToken: string;
}

export const ExistingInstagramModal: FC<{
    accounts: SavedAccount[];
    update?: () => void;
}> = ({ accounts, update }) => {
    const [selectedAccount, setSelectedAccount] = useState<{ account: InstagramAccount; savedAccount: SavedAccount } | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedAccount) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/instagram/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    accountId: selectedAccount.account.id,
                    pageId: selectedAccount.account.pageId,
                    accessToken: selectedAccount.savedAccount.token,
                    refreshToken: selectedAccount.savedAccount.refreshToken,
                }),
            });

            modal.closeAll();
            router.refresh();
            if (update) update();
            toaster.show('Instagram account added successfully', 'success');
        } catch (error) {
            toaster.show('Failed to add Instagram account', 'warning');
        } finally {
            setLoading(false);
        }
    }, [selectedAccount]);

    if (accounts.length === 0) {
        return (
            <div className="p-[20px] text-center">
                <p>No saved Instagram accounts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add an Instagram channel first to save your account.
                </p>
            </div>
        );
    }

    const allAccounts = accounts.flatMap(savedAccount =>
        savedAccount.pages.map(account => ({
            ...account,
            savedAccount,
        }))
    );

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            <div>
                <h3 className="mb-[10px] font-semibold">Select Instagram Account</h3>
                <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                    {allAccounts.map((account) => (
                        <div
                            key={account.id}
                            onClick={() => setSelectedAccount({ account, savedAccount: account.savedAccount })}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedAccount?.account.id === account.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={account.picture.data.url || '/no-picture.jpg'}
                                    className="w-[36px] h-[36px] rounded-[8px]"
                                    alt={account.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{account.name}</div>
                                    <div className="text-xs text-gray-500">{account.savedAccount.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleConnect}
                    disabled={!selectedAccount || loading}
                >
                    {loading ? 'Connecting...' : 'Connect Account'}
                </Button>
            </div>
        </div>
    );
};
