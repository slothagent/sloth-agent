import axios from "axios";
const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";

// Helper function to wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make the API request with retries
async function generateImage(prompt: string, retries = 5, backoffMs = 1000): Promise<Buffer> {
  try {
    const response = await axios.post(
      API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}`,
        },
        responseType: "arraybuffer",
      }
    );
    return response.data;
  } catch (error: any) {
    if (retries > 0) {
      if (error.response?.status === 503) {
        // Model is loading, wait before retrying
        await sleep(2000);
        return generateImage(prompt, retries - 1, backoffMs);
      }
      
      if (error.response?.status === 429) {
        // Rate limit hit, use exponential backoff
        const nextBackoff = backoffMs * 2;
        console.log(`Rate limited. Waiting ${backoffMs}ms before retry...`);
        await sleep(backoffMs);
        return generateImage(prompt, retries - 1, nextBackoff);
      }
    }
    throw error;
  }
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required." }), { status: 400 });
  }

  try {
    const imageBuffer = await generateImage(prompt);
    
    // Convert binary image to Base64
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    // Send image data back to the client
    return new Response(JSON.stringify({ image: imageDataUrl }), { status: 200 });
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image. Please try again later.",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500 }
    );
  }
}
