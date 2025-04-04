
const webSearchTool = async (query: string): Promise<any> => {
    try {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.append('q', query);
      url.searchParams.append('count', '5');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Web search error:', error);
      throw new Error('❌ Agent is currently experiencing issues. Please try again later.');
    }
}

export { webSearchTool };