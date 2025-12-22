'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ExistingChannelsModal } from './existing.channels.modal.component';
import useSWR from 'swr';

export const useExistingChannels = (update?: () => void) => {
    const modal = useModals();
    const fetch = useFetch();

    // Preload data using SWR - fetches on mount and caches
    const { data: savedAccounts, isLoading } = useSWR(
        '/integrations/social/gmb/saved-accounts',
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

    return useCallback(() => {
        // Open modal immediately with cached data
        modal.openModal({
            title: 'Existing Google Business Accounts',
            withCloseButton: true,
            children: <ExistingChannelsModal accounts={savedAccounts || []} update={update} />,
        });
    }, [savedAccounts, update]);
};

export const ExistingChannelsButton: FC<{ update?: () => void }> = ({ update }) => {
    const openExisting = useExistingChannels(update);
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
                {t('existing_channels', 'Existing Channels')}
            </div>
        </button>
    );
};
