import { assetUrl } from '../utils/assets'

interface PixelIconProps {
  name: string
  alt?: string
  size?: number
  className?: string
}

export default function PixelIcon({ name, alt = '', size = 28, className = '' }: PixelIconProps) {
  return <img className={`pixel-icon ${className}`} src={assetUrl(`pixel-icons/${name}.png`)} alt={alt} width={size} height={size} />
}
