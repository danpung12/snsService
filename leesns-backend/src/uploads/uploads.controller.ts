import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('post-image')
  @UseInterceptors(FilesInterceptor('images', 4))
  uploadPostImage(@UploadedFiles() files: Express.Multer.File[]) {
    return {
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('image'))
  uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
    };
  }
}
