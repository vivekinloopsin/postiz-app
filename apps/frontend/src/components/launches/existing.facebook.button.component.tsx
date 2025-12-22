'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useSWR from 'swr';

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

export const useExistingFacebookChannels = (update?: () => void) => {
    const modal = useModals();
    const fetch = useFetch();

    // Preload data using SWR
    const { data: savedAccounts } = useSWR(
        '/integrations/social/facebook/saved-accounts',
        async (url) => {
            try {
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                return [];
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 0,
        }
    );

    return useCallback(async () => {
        const { ExistingFacebookModal } = await import('./existing.facebook.modal.component');
        modal.openModal({
            title: 'Existing Facebook Pages',
            withCloseButton: true,
            children: <ExistingFacebookModal accounts={savedAccounts || []} update={update} />,
        });
    }, [savedAccounts, update]);
};

export const ExistingFacebookButton: FC<{ update?: () => void }> = ({ update }) => {
    const openExisting = useExistingFacebookChannels(update);
    const t = useT();

    return (
        <button
            className="text-btnText bg-btnSimple h-[44px] pt-[12px] pb-[14px] ps-[16px] pe-[20px] justify-center items-center flex rounded-[8px] gap-[8px]"
            onClick={openExisting}
        >
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5C10 2.22386 9.77614 2 9.5 2C9.22386 2 9 2.22386 9 2.5V9H2.5C2.22386 9 2 9.22386 2 9.5C2 9.77614 2.22386 10 2.5 10H9V16.5C9 16.7761 9.22386 17 9.5 17C9.77614 17 10 16.7761 10 16.5V10H16.5C16.7761 10 17 9.77614 17 9.5C17 9.22386 16.7761 9 16.5 9H10V2.5Z" fill="currentColor" />
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
            </div>
            <div className="text-start text-[16px] group-[.sidebar]:hidden">
                {t('existing_facebook_pages', 'Existing Facebook Pages')}
            </div>
        </button>
    );
};
