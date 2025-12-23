'use client';

import { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useRouter } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

interface LinkedinPage {
    id: string;
    pageId: string;
    name: string;
    username: string;
    picture: string;
}

interface SavedAccount {
    rootId: string;
    name: string;
    picture: string;
    pages: LinkedinPage[];
    token: string;
    refreshToken: string;
}

export const ExistingLinkedinModal: FC<{
    accounts: SavedAccount[];
    update?: () => void;
}> = ({ accounts, update }) => {
    const [selectedPage, setSelectedPage] = useState<{ page: LinkedinPage; savedAccount: SavedAccount } | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedPage) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/linkedin/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    pageId: selectedPage.page.id,
                    accessToken: selectedPage.savedAccount.token,
                    refreshToken: selectedPage.savedAccount.refreshToken,
                }),
            });

            modal.closeAll();
            router.refresh();
            if (update) update();
            toaster.show('LinkedIn page added successfully', 'success');
        } catch (error) {
            toaster.show('Failed to add LinkedIn page', 'warning');
        } finally {
            setLoading(false);
        }
    }, [selectedPage]);

    if (accounts.length === 0) {
        return (
            <div className="p-[20px] text-center">
                <p>No saved LinkedIn accounts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add a LinkedIn channel first to save your account.
                </p>
            </div>
        );
    }

    const allPages = accounts.flatMap(savedAccount =>
        savedAccount.pages.map(page => ({
            ...page,
            savedAccount,
        }))
    );

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            <div>
                <h3 className="mb-[10px] font-semibold">Select LinkedIn Page</h3>
                <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                    {allPages.map((page) => (
                        <div
                            key={page.id}
                            onClick={() => setSelectedPage({ page, savedAccount: page.savedAccount })}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedPage?.page.id === page.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={page.picture || '/no-picture.jpg'}
                                    className="w-[36px] h-[36px] rounded-[8px]"
                                    alt={page.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{page.name}</div>
                                    <div className="text-xs text-gray-500">{page.savedAccount.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleConnect}
                    disabled={!selectedPage || loading}
                >
                    {loading ? 'Connecting...' : 'Connect Page'}
                </Button>
            </div>
        </div>
    );
};
