import { useEffect } from 'react';
import { useGetSeoSettingByPage } from '../hooks/useQueries';

interface SEOHeadProps {
  page: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export default function SEOHead({ page, defaultTitle, defaultDescription }: SEOHeadProps) {
  const { data: seoSetting } = useGetSeoSettingByPage(page);

  useEffect(() => {
    const title = seoSetting?.metaTitle || defaultTitle;
    const description = seoSetting?.metaDescription || defaultDescription;

    if (title) {
      document.title = title;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [seoSetting, defaultTitle, defaultDescription]);

  return null;
}
