'use client';

import { useCallback } from 'react';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const LogoutButton = () => {
    const fetch = useFetch();
    const { isSecured } = useVariables();
    const t = useT();

    const logout = useCallback(async () => {
        if (
            await deleteDialog(
                t(
                    'are_you_sure_you_want_to_logout',
                    'Are you sure you want to logout?'
                ),
                t('yes_logout', 'Yes logout')
            )
        ) {
            if (isSecured) {
                try {
                    await fetch('/user/logout', {
                        method: 'POST',
                    });
                } catch (e) {
                    console.error('Logout fetch failed', e);
                }
            }
            setCookie('auth', '', -10);
            window.location.href = '/auth/logout';
        }
    }, [isSecured, fetch, t]);

    return (
        <div onClick={logout} className="select-none cursor-pointer">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
        </div>
    );
};
