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
  const [pages, setSelectedPages] = useState<Array<{ id: string; pageId: string; }>>([]);
  const [showAll, setShowAll] = useState(false);

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
        if (prev.find((p) => p.id === param.id)) {
          return prev.filter((p) => p.id !== param.id);
        }
        return [...prev, param];
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
    await onSave(pages.map((p) => ({ page: p.id })));
  }, [onSave, pages]);

  const filteredData = useMemo(() => {
    if (showAll) {
      return data || [];
    }
    return (
      data?.filter((p: { id: string }) => !existingId.includes(p.id)) || []
    );
  }, [data, existingId, showAll]);

  const selectAll = useCallback(() => {
    if (pages.length === filteredData.length) {
      setSelectedPages([]);
      return;
    }
    setSelectedPages(
      filteredData.map((p: any) => ({
        id: p.id,
        pageId: p.pageId,
      }))
    );
  }, [pages, filteredData]);

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
      <div className="flex justify-between items-center">
        <div>{t('select_linkedin_page', 'Select Linkedin Page:')}</div>
        <div className="flex gap-[10px]">
          {!!filteredData?.length && (
            <div
              onClick={selectAll}
              className="cursor-pointer text-primary underline"
            >
              {pages.length === filteredData.length
                ? t('deselect_all', 'Deselect All')
                : t('select_all', 'Select All')}
            </div>
          )}
          {!!data?.length && (
            <div
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer text-primary underline"
            >
              {showAll
                ? t('hide_existing', 'Hide Existing')
                : t('show_all', 'Show All')}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 justify-items-center select-none cursor-pointer gap-[10px]">
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
                'flex flex-col w-full text-center gap-[10px] border border-input p-[10px] hover:bg-seventh rounded-[8px]',
                existingId.includes(p.id) ? 'opacity-50' : '',
                pages.find((page) => page.id === p.id) && 'bg-seventh border-primary'
              )}
              onClick={togglePage(p)}
            >
              <div>
                <img className="w-full rounded-[8px]" src={p.picture} alt="profile" />
              </div>
              <div className="truncate w-full">{p.name}</div>
            </div>
          )
        )}
      </div>
      <div>
        <Button disabled={!pages.length} onClick={saveLinkedin}>
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};
