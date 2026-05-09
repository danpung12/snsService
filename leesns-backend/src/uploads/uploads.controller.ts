import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FilesInterceptor } from '@nestjs/platform-express';

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
}
