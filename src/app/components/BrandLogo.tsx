import { Link } from 'react-router';
import cozipLogo from '../../../assets/cozip-web-logo.png';

type BrandLogoProps = {
  to?: string;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export function BrandLogo({
  to = '/',
  className,
  imageClassName,
  alt = 'Cozip',
}: BrandLogoProps) {
  return (
    <Link to={to} className={className} aria-label="Cozip home">
      <img src={cozipLogo} alt={alt} className={imageClassName} />
    </Link>
  );
}