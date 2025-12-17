'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';

export const GmbContinue: FC<{
  onSave: (data: any) => Promise<void>;
  existingId: string[];
}> = (props) => {
  const { onSave, existingId } = props;
  const call = useCustomProviderFunction();
  const [locations, setSelectedLocations] = useState<
    Array<{
      id: string;
      accountName: string;
      locationName: string;
    }>
  >([]);
  const t = useT();

  const loadPages = useCallback(async () => {
    try {
      const pages = await call.get('pages');
      return pages;
    } catch (e) {
      // Handle error silently
    }
  }, []);

  const toggleLocation = useCallback(
    (param: { id: string; accountName: string; locationName: string }) => () => {
      setSelectedLocations((prev) => {
        const exists = prev.find((loc) => loc.id === param.id);
        if (exists) {
          // Remove if already selected
          return prev.filter((loc) => loc.id !== param.id);
        } else {
          // Add if not selected
          return [...prev, param];
        }
      });
    },
    []
  );

  const { data, isLoading } = useSWR('load-gmb-locations', loadPages, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  const saveGmb = useCallback(async () => {
    await onSave(locations);
  }, [onSave, locations]);

  const filteredData = useMemo(() => {
    return (
      data?.filter((p: { id: string }) => !existingId.includes(p.id)) || []
    );
  }, [data, existingId]);

  if (!isLoading && !data?.length) {
    return (
      <div className="text-center flex flex-col justify-center items-center text-[18px] leading-[26px] h-[300px]">
        {t(
          'gmb_no_locations_found',
          "We couldn't find any business locations connected to your account."
        )}
        <br />
        <br />
        {t(
          'gmb_ensure_business_verified',
          'Please ensure your business is verified on Google My Business.'
        )}
        <br />
        <br />
        {t(
          'gmb_try_again',
          'Please close this dialog, delete the integration and try again.'
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div>{t('select_location', 'Select Business Location:')}</div>
      <div className="grid grid-cols-3 justify-items-center select-none cursor-pointer gap-[10px]">
        {filteredData?.map(
          (p: {
            id: string;
            name: string;
            accountName: string;
            locationName: string;
            picture: {
              data: {
                url: string;
              };
            };
          }) => (
            <div
              key={p.id}
              className={clsx(
                'flex flex-col w-full text-center gap-[10px] border border-input p-[10px] hover:bg-seventh rounded-[8px] relative',
                locations.find((loc) => loc.id === p.id) && 'bg-seventh border-primary'
              )}
              onClick={toggleLocation({
                id: p.id,
                accountName: p.accountName,
                locationName: p.locationName,
              })}
            >
              {locations.find((loc) => loc.id === p.id) && (
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
              <div className="flex justify-center">
                {p.picture?.data?.url ? (
                  <img
                    className="w-[80px] h-[80px] object-cover rounded-[8px]"
                    src={p.picture.data.url}
                    alt={p.name}
                  />
                ) : (
                  <div className="w-[80px] h-[80px] bg-input rounded-[8px] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium">{p.name}</div>
            </div>
          )
        )}
      </div>
      <div className="flex flex-col gap-[10px]">
        {locations.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {t('selected_count', `${locations.length} location(s) selected`)}
          </div>
        )}
        <Button disabled={locations.length === 0} onClick={saveGmb}>
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

