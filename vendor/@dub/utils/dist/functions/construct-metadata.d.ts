import { Metadata } from 'next';

declare function constructMetadata({ title, fullTitle, description, image, video, icons, url, canonicalUrl, noIndex, manifest, }?: {
    title?: string;
    fullTitle?: string;
    description?: string;
    image?: string | null;
    video?: string | null;
    icons?: Metadata["icons"];
    url?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    manifest?: string | URL | null;
}): Metadata;

export { constructMetadata };
