import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileType } from '../entities/file.entity';

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @IsNotEmpty()
  @IsString()
  entityType: string;

  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @IsOptional()
  @IsString()
  bucket?: string;
}