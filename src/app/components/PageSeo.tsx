import { Helmet } from 'react-helmet-async';

type PageSeoProps = {
  title: string;
};

function toFullTitle(title: string) {
  return title.includes('Cozip') ? title : `${title} | Cozip`;
}

export function PageSeo({ title }: PageSeoProps) {
  return (
    <Helmet>
      <title>{toFullTitle(title)}</title>
    </Helmet>
  );
}