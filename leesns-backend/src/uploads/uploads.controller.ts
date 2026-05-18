import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({ summary: '게시글 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '게시글 이미지 업로드 성공',
    schema: {
      example: {
        filenames: ['post-image-1.jpg', 'post-image-2.jpg'],
      },
    },
  })
  @Post('post-image')
  @UseInterceptors(FilesInterceptor('images', 4))
  uploadPostImage(@UploadedFiles() files: Express.Multer.File[]) {
    return {
      filenames: files.map((file) => file.filename),
    };
  }

  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '프로필 이미지 업로드 성공',
    schema: {
      example: {
        filename: 'profile-image.jpg',
      },
    },
  })
  @Post('profile-image')
  @UseInterceptors(FileInterceptor('image'))
  uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
    };
  }

  @ApiOperation({ summary: 'Presigned URL 발급' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['filename', 'contentType'],
      properties: {
        filename: { type: 'string', example: 'image.png' },
        contentType: { type: 'string', example: 'image/png' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL 발급 성공',
    schema: {
      example: {
        uploadUrl:
          'https://example.r2.cloudflarestorage.com/bucket/images/uuid.png?X-Amz-Algorithm=AWS4-HMAC-SHA256',
        fileUrl: 'https://cdn.example.com/images/uuid.png',
        key: 'images/uuid.png',
      },
    },
  })
  @Post('presigned-url')
  createPresignedUrl(@Body() body: { filename: string; contentType: string }) {
    return this.uploadsService.createPresignedUrl(
      body.filename,
      body.contentType,
    );
  }
}
