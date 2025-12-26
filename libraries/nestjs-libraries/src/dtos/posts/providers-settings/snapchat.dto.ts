import { IsOptional, IsString } from 'class-validator';

export class SnapchatDto {
    @IsString()
    @IsOptional()
    title?: string;
}
