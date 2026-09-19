import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, user-scalable=no"
        />
        <title>Budget</title>
        <meta name="description" content="Gestion de budget personnelle haute précision" />
        <meta name="theme-color" content="#0B0B0E" />

        {/* Support PWA iOS - Plein écran sans barre Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Budget" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Préchargement ultra-rapide de la police d'icônes Ionicons pour éviter tout rectangle manquant */}
        <link rel="preload" href="/fonts/Ionicons.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />

        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'Ionicons';
                src: url('/fonts/Ionicons.ttf') format('truetype');
                font-display: block;
              }

              /* Plein écran iOS Safari & PWA sans bande blanche vers le bas */
              html {
                background-color: #0B0B0E !important;
                height: 100% !important;
                height: 100dvh !important;
                height: -webkit-fill-available !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-text-size-adjust: 100% !important;
              }

              body {
                background-color: #0B0B0E !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                min-height: 100% !important;
                min-height: 100dvh !important;
                min-height: -webkit-fill-available !important;
                overflow: hidden !important;
                overscroll-behavior-y: none !important;
                -webkit-overflow-scrolling: touch !important;
                -webkit-font-smoothing: antialiased !important;
              }

              #root {
                background-color: #0B0B0E !important;
                width: 100% !important;
                height: 100% !important;
                min-height: 100% !important;
                min-height: 100dvh !important;
                min-height: -webkit-fill-available !important;
                display: flex !important;
                flex-direction: column !important;
                flex: 1 1 100% !important;
              }

              input, textarea, button, select {
                outline: none !important;
                -webkit-tap-highlight-color: transparent;
              }
              *:focus {
                outline: none !important;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
