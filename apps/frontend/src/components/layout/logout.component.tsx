'use client';

import { useCallback } from 'react';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
export const LogoutComponent = () => {
  const fetch = useFetch();
  const { isGeneral, isSecured } = useVariables();
  const t = useT();

  const logout = useCallback(async () => {
    console.log('Logout button clicked');
    // alert('Logout clicked');
    if (
      await deleteDialog(
        t(
          'are_you_sure_you_want_to_logout',
          'Are you sure you want to logout?'
        ),
        t('yes_logout', 'Yes logout')
      )
    ) {
      console.log('Logout confirmed');
      // alert('Logout confirmed');
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
    <div className="text-red-400 cursor-pointer" onClick={logout}>
      {t('logout_from', 'Logout from')}
      {isGeneral ? ' Postiz' : ' Gitroom'}
    </div>
  );
};
