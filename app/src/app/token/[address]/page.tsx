import TokenDetails from '@/components/custom/tokenDetails';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ address: string }>
}


export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const tokenAddress = (await params).address

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/token?address=${tokenAddress}`)
    const token = await res.json()
    return {
        title: `${token?.data?.name} - Sloth Agent`,
        description: 'View and manage your token details',
        openGraph: {
            title: `${token?.data?.name} - Sloth Agent`,
            description: 'View and manage your token details',
            images: [
                {
                    url: `${token?.data?.imageUrl}`,
                    width: 1200,
                    height: 630,
                    alt: `${token?.data?.name} token details`
                }
            ]
        }
    }
}     

const TokenDetailsPage = async ({ params }: Props) => {
    const tokenAddress = (await params).address
    return (
        <TokenDetails tokenAddress={tokenAddress as string} />
    )
}

export default TokenDetailsPage;