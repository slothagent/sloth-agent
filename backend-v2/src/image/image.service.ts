import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private replicate: any;

  constructor(private configService: ConfigService) {
    // Import Replicate dynamically to handle CommonJS module
    const Replicate = require('replicate');
    this.replicate = new Replicate({
      auth: this.configService.get<string>('REPLICATE_API_TOKEN'),
    });
  }

  async generateImage(prompt: string): Promise<string> {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const prediction = await this.replicate.predictions.create({
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        scheduler: "K_EULER",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        refine: "base_image_refiner",
        high_noise_frac: 0.8,
      }
    });

    if (prediction?.error) {
      throw new Error(prediction.error);
    }

    const result = await this.replicate.wait(prediction);

    if (!result?.output || !Array.isArray(result.output) || result.output.length === 0) {
      throw new Error('No image generated');
    }

    const imageUrl = result.output[0];

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid image URL received');
    }

    return imageUrl;
  }
} 