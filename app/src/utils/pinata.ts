interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export async function uploadTokenMetadataToPinata(metadata: TokenMetadata) {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.name}-metadata.json`
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
    }

    const result = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export async function uploadImageToPinata(imageFile: File, name: string) {
  try {
    // Create form data directly with the File object
    const formData = new FormData();
    formData.append('file', imageFile, `${name}.png`);
    formData.append('pinataMetadata', JSON.stringify({
      name: `${name}.png`
    }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image to Pinata: ${response.statusText}`);
    }

    const result = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading image to Pinata:', error);
    throw error;
  }
} 