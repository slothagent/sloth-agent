import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('generate-image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  async generateImage(@Body() body: { prompt: string }) {
    try {
      const { prompt } = body;

      if (!prompt) {
        throw new HttpException('Prompt is required', HttpStatus.BAD_REQUEST);
      }

      const imageUrl = await this.imageService.generateImage(prompt);
      return { imageUrl };
    } catch (error) {
      console.error('Error generating image:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 