import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Create a prediction
        const prediction = await replicate.predictions.create({
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
            return NextResponse.json({ error: prediction.error }, { status: 500 });
        }

        // Wait for the prediction to complete
        let result = await replicate.wait(prediction);

        // Check if we have valid output
        if (!result?.output || !Array.isArray(result.output) || result.output.length === 0) {
            return NextResponse.json(
                { error: 'No image generated' },
                { status: 500 }
            );
        }

        const imageUrl = result.output[0];

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json(
                { error: 'Invalid image URL received' },
                { status: 500 }
            );
        }

        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Failed to generate image' },
            { status: 500 }
        );
    }
} 