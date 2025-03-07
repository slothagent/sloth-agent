require('dotenv').config();

const fetchTweets = async () => {
    const requestData = {
        query: [
            {
                category: "Latest",
                query: `#SlothAgent #DOR`,
            }
        ]
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_TWITTER}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to fetch tweets');
    }
    
    const data = await response.json();
    console.log(data);
}

const validateRequest = async () => {
    const requestData = {
        query: [
            {
                category: "Latest",
                query: `#SlothAgent #DOR`,
            }
        ]
    };
    
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_TWITTER}/validate_search`,
            requestData
        );
        console.log('Validation result:', response.data);
        return response.data;
    } catch (error) {
        console.error('Validation error:', error.response?.data);
        throw error;
    }
} 

 fetchTweets();
