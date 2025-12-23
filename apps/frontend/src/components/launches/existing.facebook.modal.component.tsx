'use client';

import { FC, useState, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useRouter } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { Button } from '@gitroom/react/form/button';

interface FacebookPage {
    id: string;
    name: string;
    username: string;
    picture: { data: { url: string } };
}

interface SavedAccount {
    rootId: string;
    name: string;
    picture: string;
    pages: FacebookPage[];
    token: string;
    refreshToken: string;
}

export const ExistingFacebookModal: FC<{
    accounts: SavedAccount[];
    update?: () => void;
}> = ({ accounts, update }) => {
    const [selectedPage, setSelectedPage] = useState<{ pageId: string; account: SavedAccount } | null>(null);
    const [loading, setLoading] = useState(false);
    const fetch = useFetch();
    const router = useRouter();
    const modal = useModals();
    const toaster = useToaster();

    const handleConnect = useCallback(async () => {
        if (!selectedPage) return;

        setLoading(true);
        try {
            await fetch('/integrations/social/facebook/connect-saved', {
                method: 'POST',
                body: JSON.stringify({
                    pageId: selectedPage.pageId,
                    accessToken: selectedPage.account.token,
                    refreshToken: selectedPage.account.refreshToken,
                }),
            });

            modal.closeAll();
            router.refresh();
            if (update) update();
            toaster.show('Facebook page added successfully', 'success');
        } catch (error) {
            toaster.show('Failed to add Facebook page', 'warning');
        } finally {
            setLoading(false);
        }
    }, [selectedPage]);

    if (accounts.length === 0) {
        return (
            <div className="p-[20px] text-center">
                <p>No saved Facebook accounts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                    Add a Facebook channel first to save your account.
                </p>
            </div>
        );
    }

    // Flatten and deduplicate pages
    const allPagesMap = new Map();

    accounts.forEach(account => {
        account.pages.forEach(page => {
            if (!allPagesMap.has(page.id)) {
                allPagesMap.set(page.id, {
                    ...page,
                    account
                });
            }
        });
    });

    const allPages = Array.from(allPagesMap.values());

    return (
        <div className="flex flex-col gap-[20px] p-[20px]">
            {/* Page Selection */}
            <div>
                <h3 className="mb-[10px] font-semibold">Select Facebook Page</h3>
                <div className="grid grid-cols-1 gap-[10px] max-h-[400px] overflow-y-auto">
                    {allPages.map((page) => (
                        <div
                            key={page.id}
                            onClick={() => setSelectedPage({ pageId: page.id, account: page.account })}
                            className={`cursor-pointer p-[15px] rounded-[8px] border-2 transition-all ${selectedPage?.pageId === page.id
                                ? 'border-primary bg-primary/10'
                                : 'border-tableBorder bg-newTableHeader hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={page.picture.data.url || '/no-picture.jpg'}
                                    className="w-[36px] h-[36px] rounded-[8px]"
                                    alt={page.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{page.name}</div>
                                    <div className="text-xs text-gray-500">{page.account.name}</div>
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
                    disabled={!selectedPage || loading}
                >
                    {loading ? 'Connecting...' : 'Connect Page'}
                </Button>
            </div>
        </div>
    );
};
