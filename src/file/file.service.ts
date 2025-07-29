import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { File, FileType } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'nestjs-pino';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  private getFileType(mimetype: string): FileType {
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (mimetype.startsWith('audio/')) return FileType.AUDIO;
    if (
      mimetype === 'application/pdf' ||
      mimetype.includes('document') ||
      mimetype.includes('text/') ||
      mimetype.includes('application/vnd')
    )
      return FileType.DOCUMENT;
    return FileType.OTHER;
  }

  async uploadFile(
    file: any,
    entityId: string,
    entityType: string,
    customFileType?: FileType,
    bucket = 'files',
  ) {
    console.log('file', file);
    console.log('entityId', entityId);
    console.log('entityType', entityType);
    console.log('customFileType', customFileType);
    console.log('bucket', bucket);
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${entityType}/${entityId}/${uuidv4()}.${fileExtension}`;

      // Get Supabase client
      const supabase = this.supabaseService.getSupabaseClient();

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueFilename, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error('Supabase storage upload error:', error);
        throw new InternalServerErrorException(
          `Failed to upload file: ${error.message}`,
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueFilename);

      // Save file metadata to database
      const fileType = customFileType || this.getFileType(file.mimetype);
      const fileEntity = this.fileRepository.create({
        filename: uniqueFilename,
        originalname: file.originalname,
        path: urlData.publicUrl,
        mimetype: file.mimetype,
        size: file.size,
        type: fileType,
        bucket,
        entityId,
        entityType,
      });

      return await this.fileRepository.save(fileEntity);
    } catch (error) {
      this.logger.error('File upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  async deleteFile(fileId: string) {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    try {
      // Delete from Supabase Storage
      const supabase = this.supabaseService.getSupabaseClient();
      const { error } = await supabase.storage
        .from(file.bucket)
        .remove([file.filename]);

      if (error) {
        this.logger.error('Supabase storage delete error:', error);
        throw new InternalServerErrorException(
          `Failed to delete file from storage: ${error.message}`,
        );
      }

      // Delete from database
      await this.fileRepository.remove(file);
      return { message: 'File deleted successfully' };
    } catch (error) {
      this.logger.error('File deletion error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  async getFilesByEntity(entityId: string, entityType: string) {
    return this.fileRepository.find({
      where: { entityId, entityType },
      order: { createdAt: 'DESC' },
    });
  }

  async getFileById(fileId: string) {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }
    return file;
  }
}
