import { FC } from 'react';
import {
    PostComment,
    withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { SnapchatDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/snapchat.dto';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { Input } from '@gitroom/react/form/input';

const SnapchatSettings: FC = () => {
    const { register } = useSettings();

    return (
        <div className="flex flex-col gap-4">
            <Input label="Title" {...register('title')} placeholder="Snapchat Title" />
        </div>
    );
};

export default withProvider({
    postComment: PostComment.POST,
    minimumCharacters: [],
    SettingsComponent: SnapchatSettings,
    CustomPreviewComponent: undefined,
    dto: SnapchatDto,
    maximumCharacters: 1000,
});
