# NeuroDetect Lab

Application web React/Vite pour l'analyse IRM Alzheimer, preparee aussi pour un usage mobile.

## Ce qui a ete ajoute

- une PWA installable sur mobile
- un service worker de base pour le cache applicatif
- une invite d'installation dans l'interface
- une page de telechargement APK prete pour l'hebergement
- une configuration Capacitor de depart

## Fichiers principaux

- `public/manifest.webmanifest`
- `public/sw.js`
- `src/components/PwaInstallPrompt.tsx`
- `src/lib/pwa.ts`
- `public/download/index.html`
- `capacitor.config.json`

## Lien APK prevu

Quand l'APK sera genere, placez-le ici:

`public/download/app-release.apk`

Le lien public sera alors:

`/download/app-release.apk`

La page de telechargement sera:

`/download/`

## Outils Android encore manquants ici

Les outils suivants ne sont pas installes dans cet environnement:

- `java`
- `gradle`
- `adb`

## Etapes futures pour sortir un APK

Installer les packages Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

Puis lancer:

```bash
npm run build
npx cap add android
npx cap sync android
```

Ensuite, ouvrir le projet Android dans Android Studio pour produire l'APK release.

## Signature release Android

Le projet est maintenant prepare pour une signature release via:

- `android/gradle.properties` pour `appVersionCode` et `appVersionName`
- `android/keystore.properties` pour les secrets de signature
- `android/keystore.properties.example` comme modele

Exemple de preparation:

1. Creer votre keystore release, par exemple `android/release-keystore.jks`
2. Copier `android/keystore.properties.example` vers `android/keystore.properties`
3. Remplir:

```properties
storeFile=release-keystore.jks
storePassword=VOTRE_MOT_DE_PASSE
keyAlias=neurodetectlab
keyPassword=VOTRE_MOT_DE_PASSE
```

4. Ouvrir `android/` dans Android Studio
5. Lancer une build release signee pour obtenir `app-release.apk`

Fichiers sensibles ignores par Git:

- `android/keystore.properties`
- `*.jks`
- `*.keystore`
