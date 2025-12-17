'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';

export const LinkedinContinue: FC<{
  onSave: (data: any) => Promise<void>;
  existingId: string[];
}> = (props) => {
  const { onSave, existingId } = props;
  const t = useT();

  const call = useCustomProviderFunction();
  const [pages, setSelectedPages] = useState<
    Array<{
      id: string;
      pageId: string;
    }>
  >([]);
  const loadPages = useCallback(async () => {
    try {
      const pages = await call.get('companies');
      return pages;
    } catch (e) {
      // Handle error silently
    }
  }, []);
  const togglePage = useCallback(
    (param: { id: string; pageId: string }) => () => {
      setSelectedPages((prev) => {
        const exists = prev.find((p) => p.id === param.id);
        if (exists) {
          return prev.filter((p) => p.id !== param.id);
        } else {
          return [...prev, param];
        }
      });
    },
    []
  );
  const { data, isLoading } = useSWR('load-pages', loadPages, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
  const saveLinkedin = useCallback(async () => {
    await onSave({ pages: pages.map((p) => p.id) });
  }, [onSave, pages]);
  const filteredData = useMemo(() => {
    return (
      data?.filter((p: { id: string }) => !existingId.includes(p.id)) || []
    );
  }, [data]);
  if (!isLoading && !data?.length) {
    return (
      <div className="text-center flex justify-center items-center text-[18px] leading-[50px] h-[300px]">
        {t(
          'we_couldn_t_find_any_business_connected_to_your_linkedin_page',
          "We couldn't find any business connected to your LinkedIn Page."
        )}
        <br />
        {t(
          'please_close_this_dialog_create_a_new_page_and_add_a_new_channel_again',
          'Please close this dialog, create a new page, and add a new channel again.'
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-[20px]">
      <div>{t('select_linkedin_page', 'Select Linkedin Page:')}</div>
      <div className="grid grid-cols-3 justify-items-center select-none cursor-pointer">
        {filteredData?.map(
          (p: {
            id: string;
            pageId: string;
            username: string;
            name: string;
            picture: string;
          }) => (
            <div
              key={p.id}
              className={clsx(
                'flex flex-col w-full text-center gap-[10px] border border-input p-[10px] hover:bg-seventh rounded-[8px] relative',
                pages.find((pg) => pg.id === p.id) && 'bg-seventh border-primary'
              )}
              onClick={togglePage(p)}
            >
              {pages.find((pg) => pg.id === p.id) && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div>
                <img className="w-full" src={p.picture} alt="profile" />
              </div>
              <div>{p.name}</div>
            </div>
          )
        )}
      </div>
      <div className="flex flex-col gap-[10px]">
        {pages.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {t('selected_count', `${pages.length} page(s) selected`)}
          </div>
        )}
        <Button disabled={pages.length === 0} onClick={saveLinkedin}>
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};
