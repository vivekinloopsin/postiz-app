'use client';

import { FC, useCallback, useEffect } from 'react';
import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { GmbSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/gmb.settings.dto';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { Input } from '@gitroom/react/form/input';
import { Select } from '@gitroom/react/form/select';
import { useWatch, useFormContext } from 'react-hook-form';
import { GeneralPreviewComponent } from '@gitroom/frontend/components/launches/general.preview.component';

const topicTypes = [
  {
    label: 'Standard Update',
    value: 'STANDARD',
  },
  {
    label: 'Event',
    value: 'EVENT',
  },
  {
    label: 'Offer',
    value: 'OFFER',
  },
];

const callToActionTypes = [
  {
    label: 'None',
    value: 'NONE',
  },
  {
    label: 'Book',
    value: 'BOOK',
  },
  {
    label: 'Order online',
    value: 'ORDER',
  },
  {
    label: 'Shop',
    value: 'SHOP',
  },
  {
    label: 'Learn more',
    value: 'LEARN_MORE',
  },
  {
    label: 'Sign up',
    value: 'SIGN_UP',
  },
  {
    label: 'Get offer',
    value: 'GET_OFFER',
  },
  {
    label: 'Call',
    value: 'CALL',
  },
  {
    label: 'Buy',
    value: 'BUY',
  },
];

const GmbSettings: FC = () => {
  const { register, control } = useSettings();
  const topicType = useWatch({ control, name: 'topicType' });
  const callToActionType = useWatch({ control, name: 'callToActionType' });

  return (
    <div className="flex flex-col gap-[10px]">
      <Select
        label="Post Type"
        {...register('topicType', {
          value: 'STANDARD',
        })}
      >
        {topicTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Select
        label="Add a button (optional)"
        {...register('callToActionType', {
          value: 'NONE',
        })}
      >
        {callToActionTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      {callToActionType &&
        callToActionType !== 'NONE' &&
        callToActionType !== 'CALL' && (
          <Input
            label="Link for your button*"
            placeholder="https://example.com"
            {...register('callToActionUrl')}
          />
        )}

      {topicType === 'EVENT' && (
        <div className="flex flex-col gap-[10px] mt-[10px] p-[15px] border border-input rounded-[8px]">
          <div className="text-[14px] font-medium mb-[5px]">Event Details</div>
          <Input
            label="Event Title"
            placeholder="Event name"
            {...register('eventTitle')}
          />
          <div className="grid grid-cols-2 gap-[10px]">
            <Input
              label="Start Date"
              type="date"
              {...register('eventStartDate')}
            />
            <Input label="End Date" type="date" {...register('eventEndDate')} />
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <Input
              label="Start Time (optional)"
              type="time"
              {...register('eventStartTime')}
            />
            <Input
              label="End Time (optional)"
              type="time"
              {...register('eventEndTime')}
            />
          </div>
        </div>
      )}

      {topicType === 'OFFER' && (
        <div className="flex flex-col gap-[10px] mt-[10px] p-[15px] border border-input rounded-[8px]">
          <div className="text-[14px] font-medium mb-[5px]">Offer Details</div>
          <Input
            label="Coupon Code (optional)"
            placeholder="SAVE20"
            {...register('offerCouponCode')}
          />
          <Input
            label="Redeem Online URL (optional)"
            placeholder="https://example.com/redeem"
            {...register('offerRedeemUrl')}
          />
          <Input
            label="Terms & Conditions (optional)"
            placeholder="Valid until..."
            {...register('offerTerms')}
          />
        </div>
      )}
    </div>
  );
};

const GmbPreview: FC<{ maximumCharacters?: number }> = (props) => {
  const { control } = useFormContext();
  const callToActionType = useWatch({ control, name: 'callToActionType' });
  const topicType = useWatch({ control, name: 'topicType' });
  const eventTitle = useWatch({ control, name: 'eventTitle' });

  const ctaLabel = callToActionTypes.find(
    (t) => t.value === callToActionType
  )?.label;

  return (
    <div className="flex flex-col gap-[12px]">
      <GeneralPreviewComponent {...props} />
      {(callToActionType && callToActionType !== 'NONE') ||
        (topicType === 'EVENT' && eventTitle) ? (
        <div className="px-[16px] pb-[16px] mt-[-10px]">
          <div className="bg-white/5 border border-white/10 rounded-[12px] p-[16px] flex flex-col gap-[12px] shadow-xl">
            {topicType === 'EVENT' && eventTitle && (
              <div className="text-[16px] font-bold text-white border-b border-white/10 pb-[8px]">
                📅 {eventTitle}
              </div>
            )}
            {callToActionType && callToActionType !== 'NONE' && (
              <div className="flex justify-center">
                <div className="w-full py-[10px] px-[20px] bg-[#4285F4] hover:bg-[#357ae8] text-white text-center rounded-[24px] font-medium transition-colors cursor-default select-none">
                  {ctaLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default withProvider({
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: GmbSettings,
  CustomPreviewComponent: GmbPreview,
  dto: GmbSettingsDto,
  checkValidity: async (items, settings: any) => {
    // GMB posts can have text only, or text with one image
    if (items.length > 0 && items[0].length > 1) {
      return 'Google My Business posts can only have one image';
    }

    // Check for video - GMB doesn't support video in local posts
    if (items.length > 0 && items[0].length > 0) {
      const media = items[0][0];
      if (media.path.indexOf('mp4') > -1) {
        return 'Google My Business posts do not support video attachments';
      }
    }

    // Event posts require a title
    if (settings.topicType === 'EVENT' && !settings.eventTitle) {
      return 'Event posts require an event title';
    }

    return true;
  },
  maximumCharacters: 1500,
});
