import React, { useEffect } from 'react';
import { useGetSeoByPage } from '../hooks/useQueries';

interface SEOHeadProps {
  page: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export default function SEOHead({ page, defaultTitle, defaultDescription }: SEOHeadProps) {
  const { data: seoSetting } = useGetSeoByPage(page);

  const title = seoSetting?.metaTitle || defaultTitle || 'Boby Dhorajiya – Flutter & React Native Developer';
  const description = seoSetting?.metaDescription || defaultDescription || 'Mobile app developer specializing in Flutter, React Native & mobile security.';

  useEffect(() => {
    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [title, description]);

  return null;
}
