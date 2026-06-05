/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ["@prisma/client", "prisma"],
	webpack(config, { dev }) {
		if (dev) {
			config.cache = false;
		}

		return config;
	},
};

export default nextConfig;
