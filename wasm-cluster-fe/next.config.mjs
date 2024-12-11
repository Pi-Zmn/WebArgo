/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: process.env.NEXT_PUBLIC_BACKEND,
                port: process.env.NEXT_PUBLIC_WS_WORKER,
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_BACKEND,
                port: process.env.NEXT_PUBLIC_WS_WORKER,
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
