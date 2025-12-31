/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    // If a base path is provided (e.g. for GitHub Pages subpath), use it.
    // We will set this environment variable in the GitHub Actions workflow.
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
