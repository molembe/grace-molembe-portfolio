import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      // Upload de la photo de profil : limite serveur de l'action à 6 Mo
      // (l'action elle-même valide 4 Mo max) — la valeur par défaut de
      // Next.js est 1 Mo, ce qui rejetterait le formulaire photo.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
