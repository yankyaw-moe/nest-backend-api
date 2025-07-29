import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityId: {
          type: 'string',
        },
        entityType: {
          type: 'string',
        },
        fileType: {
          type: 'string',
          enum: ['image', 'document', 'video', 'audio', 'other'],
        },
        bucket: {
          type: 'string',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return this.fileService.uploadFile(
      file,
      uploadFileDto.entityId,
      uploadFileDto.entityType,
      uploadFileDto.fileType,
      uploadFileDto.bucket || 'files',
    );
  }

  @Get(':id')
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileService.getFileById(id);
  }

  @Get()
  async getFilesByEntity(
    @Query('entityId', ParseUUIDPipe) entityId: string,
    @Query('entityType') entityType: string,
  ) {
    return this.fileService.getFilesByEntity(entityId, entityType);
  }

  @Delete(':id')
  //   @Roles(Role.Admin, Role.User)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileService.deleteFile(id);
  }
}
