import { useQuery } from '@tanstack/react-query';

// Example function to fetch data
const fetchData = async () => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: 'Hello from React Query!' };
};

export function ExampleQuery() {
  // Use the query
  const { data, isLoading, error } = useQuery({
    queryKey: ['example'],
    queryFn: fetchData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">React Query Example</h2>
      <p>{data?.message}</p>
    </div>
  );
} 