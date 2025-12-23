'use client';

import React, { FC, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@gitroom/react/form/input';
import { Button } from '@gitroom/react/form/button';
import { showMediaBox } from '@gitroom/frontend/components/media/media.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const ProfileComponent: FC = () => {
    const { watch, setValue } = useFormContext();
    const t = useT();
    const picture = watch('picture');

    const openMedia = useCallback(() => {
        showMediaBox((values) => {
            setValue('picture', values);
        });
    }, [setValue]);

    const remove = useCallback(() => {
        setValue('picture', null);
    }, [setValue]);

    return (
        <div className="flex flex-col gap-[24px]">
            <h3 className="text-[20px]">{t('profile_settings', 'Profile Settings')}</h3>

            <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[500]">{t('profile_picture', 'Profile Picture / Organization Logo')}</label>
                <div className="flex items-center gap-[16px]">
                    <div className="w-[100px] h-[100px] rounded-[12px] bg-customColor38 overflow-hidden flex items-center justify-center border border-customColor6">
                        {picture?.path ? (
                            <img src={picture.path} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                            <div className="text-textColor opacity-50 text-[12px] text-center px-2">
                                {t('no_image', 'No image')}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-[8px]">
                        <Button type="button" onClick={openMedia} size="small">
                            {t('upload_image', 'Upload Image')}
                        </Button>
                        {picture && (
                            <button
                                type="button"
                                onClick={remove}
                                className="text-red-500 text-[12px] hover:underline text-left"
                            >
                                {t('remove_image', 'Remove Image')}
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-[12px] text-textColor opacity-70">
                    {t('logo_hint', 'This image will be used as your dashboard logo.')}
                </p>
            </div>

            <div className="flex flex-col gap-[16px]">
                <Input label={t('full_name', 'Full Name')} name="fullname" />
                <Input label={t('bio', 'Bio')} name="bio" />
            </div>

            <div className="pt-[16px]">
                <Button type="submit">
                    {t('save_profile', 'Save Profile')}
                </Button>
            </div>
        </div>
    );
};
