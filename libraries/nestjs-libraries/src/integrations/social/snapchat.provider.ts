import {
    AuthTokenDetails,
    PostDetails,
    PostResponse,
    SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import {
    SocialAbstract,
} from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { SnapchatDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/snapchat.dto';
import { Integration } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

export class SnapchatProvider extends SocialAbstract implements SocialProvider {
    identifier = 'snapchat';
    name = 'Snapchat';
    isBetweenSteps = false;
    dto = SnapchatDto;
    editor: 'normal' | 'markdown' | 'html' = 'normal';
    scopes = ['snapchat-marketing-api'];

    maxLength() {
        return 1000;
    }

    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const value = {
            client_id: process.env.SNAPCHAT_CLIENT_ID!,
            client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };

        const { access_token, refresh_token, expires_in } = await (
            await fetch('https://accounts.snapchat.com/login/oauth2/access_token', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
                body: new URLSearchParams(value).toString(),
            })
        ).json();

        return {
            refreshToken: refresh_token || refreshToken,
            expiresIn: expires_in,
            accessToken: access_token,
            requestId: refreshToken,
            id: 'snapchat_user',
            name: 'Snapchat User',
            picture: '',
            username: 'snapchat_user',
        } as any;
    }

    async generateAuthUrl() {
        const state = Math.random().toString(36).substring(2);
        const codeVerifier = randomBytes(64).toString('base64url');
        const challenge = createHash('sha256')
            .update(codeVerifier)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        return {
            url:
                'https://accounts.snapchat.com/login/oauth2/authorize' +
                `?client_id=${process.env.SNAPCHAT_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(
                    `${process.env.FRONTEND_URL}/integrations/social/snapchat`
                )}` +
                `&response_type=code` +
                `&scope=${this.scopes.join(' ')}` +
                `&state=${state}` +
                `&code_challenge=${challenge}` +
                `&code_challenge_method=S256`,
            codeVerifier,
            state,
        };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }) {
        const value = {
            client_id: process.env.SNAPCHAT_CLIENT_ID!,
            client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
            code: params.code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/snapchat`,
            code_verifier: params.codeVerifier,
        };

        const response = await fetch('https://accounts.snapchat.com/login/oauth2/access_token', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: new URLSearchParams(value).toString(),
        });

        const { access_token, refresh_token, expires_in } = await response.json();

        const { me } = await (
            await fetch('https://adsapi.snapchat.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
        ).json();

        return {
            id: me.id,
            name: me.display_name || me.snapchat_username || 'Snapchat User',
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            picture: me.bitmoji_avatar || '',
            username: me.snapchat_username || '',
        };
    }

    async post(
        id: string,
        accessToken: string,
        postDetails: PostDetails<SnapchatDto>[],
        integration: Integration
    ): Promise<PostResponse[]> {
        return postDetails.map((post) => ({
            id: post.id,
            postId: 'stub_id',
            releaseURL: 'https://snapchat.com',
            status: 'success',
        }));
    }
}
