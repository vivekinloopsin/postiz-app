'use client';

import { useCallback } from 'react';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const DeleteAccountComponent = () => {
    const fetch = useFetch();
    const t = useT();

    const deleteAccount = useCallback(async () => {
        if (
            await deleteDialog(
                t(
                    'are_you_sure_you_want_to_delete_account',
                    'Are you sure you want to delete your account? This action is permanent and cannot be undone.'
                ),
                t('yes_delete_account', 'Yes, delete my account')
            )
        ) {
            await fetch('/user/account', {
                method: 'DELETE',
            });
            setCookie('auth', '', -10);
            window.location.href = '/auth/logout';
        }
    }, [fetch, t]);

    return (
        <div className="text-red-600 font-bold cursor-pointer mt-2" onClick={deleteAccount}>
            {t('delete_account', 'Delete Account')}
        </div>
    );
};
