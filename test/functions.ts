const webSearchTool = async (query: string): Promise<any> => {
    try {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.append('q', query);
      url.searchParams.append('count', '5');

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY || ''
      };

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Format and optimize news results
      const formattedResults = data.news?.results
        .slice(0, 5) // Limit to top 5 articles
        .map((article: any) => {
          // Get main content by combining description and first snippet
          const mainContent = [
            article.description,
            article.extra_snippets?.[0] || ''
          ].filter(Boolean).join(' ').trim();

          // Remove duplicate content
          const uniqueContent = [...new Set(mainContent.split(' '))].join(' ');

          return {
            title: article.title,
            url: article.url,
            content: uniqueContent.slice(0, 500), // Limit content length
            source: article.meta_url?.hostname || '',
            published: article.page_age || ''
          };
        })
        .filter((article: any, index: number, self: any[]) => 
          // Remove duplicate articles based on similar titles
          index === self.findIndex((t) => (
            t.title.toLowerCase().includes(article.title.toLowerCase()) ||
            article.title.toLowerCase().includes(t.title.toLowerCase())
          ))
        );

      return {
        results: formattedResults
      };

    } catch (error) {
      console.error('Web search error:', error);
      throw new Error('Search failed. Please try again later.');
    }
}

export { webSearchTool };
