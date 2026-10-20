import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {};

// Loads ./i18n/request.ts for every request
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
