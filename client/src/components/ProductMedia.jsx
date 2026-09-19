import { useEffect, useState } from 'react'
import ProductIllustration from './ProductIllustration'

function isUsableProductImage(imageUrl) {
  if (!imageUrl) return false

  try {
    return new URL(imageUrl).hostname !== 'placehold.co'
  } catch {
    return false
  }
}

function ProductMedia({ imageUrl, name, factionSlug, className = '', imageClassName = '' }) {
  const [canShowImage, setCanShowImage] = useState(isUsableProductImage(imageUrl))

  useEffect(() => {
    setCanShowImage(isUsableProductImage(imageUrl))
  }, [imageUrl])

  if (canShowImage) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={imageClassName || className}
        onError={() => setCanShowImage(false)}
      />
    )
  }

  return <ProductIllustration name={name} factionSlug={factionSlug} className={className} />
}

export default ProductMedia
