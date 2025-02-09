import Image from 'next/image';

interface TokenImageProps {
    src: string;
    alt: string;
    size?: number;
}

const TokenImage = ({ src, alt, size = 96 }: TokenImageProps) => {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={alt}
                width={size}
                height={size}
                className="rounded-lg"
            />
        </div>
    );
};

export default TokenImage; 