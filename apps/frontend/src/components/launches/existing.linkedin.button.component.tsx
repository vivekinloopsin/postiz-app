'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import useSWR from 'swr';

export const useExistingLinkedinChannels = (update?: () => void) => {
    const modal = useModals();
    const fetch = useFetch();

    const { data: savedAccounts } = useSWR(
        '/integrations/social/linkedin/saved-accounts',
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
        const { ExistingLinkedinModal } = await import('./existing.linkedin.modal.component');
        modal.openModal({
            title: 'Existing LinkedIn Pages',
            withCloseButton: true,
            children: <ExistingLinkedinModal accounts={savedAccounts || []} update={update} />,
        });
    }, [savedAccounts, update]);
};

export const ExistingLinkedinButton: FC<{ update?: () => void }> = ({ update }) => {
    const openExisting = useExistingLinkedinChannels(update);
    const t = useT();

    return (
        <button
            className="text-btnText bg-btnSimple min-h-[44px] py-[8px] ps-[16px] pe-[16px] justify-start items-center flex rounded-[8px] gap-[8px] w-full"
            onClick={openExisting}
        >
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5C10 2.22386 9.77614 2 9.5 2C9.22386 2 9 2.22386 9 2.5V9H2.5C2.22386 9 2 9.22386 2 9.5C2 9.77614 2.22386 10 2.5 10H9V16.5C9 16.7761 9.22386 17 9.5 17C9.77614 17 10 16.7761 10 16.5V10H16.5C16.7761 10 17 9.77614 17 9.5C17 9.22386 16.7761 9 16.5 9H10V2.5Z" fill="currentColor" />
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
            </div>
            <div className="text-start text-[16px] group-[.sidebar]:hidden">
                {t('existing_linkedin_pages', 'Existing LinkedIn Pages')}
            </div>
        </button>
    );
};
