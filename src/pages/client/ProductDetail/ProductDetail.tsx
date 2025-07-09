import QuantityController from '@/components/QuantityController'
import { formatCurrency, getIdByNameId, handleError } from '@/lib/utils'
import { useProductDetailQuery } from '@/queries/useManageProduct'
import type { ProductType, VariantType } from '@/schemaValidations/product.schema'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { TagType } from '@/constants/tag'
import Config from '@/constants/config'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAddToCartMutation } from '@/queries/useCart'
import { toast } from 'sonner'

export default function ProductDetail() {
  const params = useParams()
  const productId = getIdByNameId(params.productName as string)

  const productDetailQuery = useProductDetailQuery(Number(productId))
  const product = productDetailQuery.data?.data

  const [buyCount, setBuyCount] = useState(0)
  const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')
  const [isOpenPreview, setIsOpenPreview] = useState(false)
  const [isOpenError, setIsOpenError] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({})
  const [errorVariation, setErrorVariation] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null)

  useEffect(() => {
    if (product && product.variantsConfig[0]?.type === 'default') {
      // If the first variant is 'default', set it as the selected variant
      const defaultVariant = product.variants.find((v) => v.value === 'default')
      if (defaultVariant) {
        setSelectedVariant(defaultVariant)
        setSelectedVariantOptions({ default: 'default' })
        setBuyCount(1)
      }
    }
  }, [product])

  const currentImages = useMemo(() => {
    if (!product || !product.images.length) return []

    // If there's a selected variant with thumbnail, move it to the front
    const images =
      selectedVariant && selectedVariant.thumbnail
        ? (() => {
            const thumbnailIndex = product.images.indexOf(selectedVariant.thumbnail)
            if (thumbnailIndex > -1) {
              // Remove thumbnail from its current position and add it to the beginning
              const reorderedImages = [...product.images]
              reorderedImages.splice(thumbnailIndex, 1)
              reorderedImages.unshift(selectedVariant.thumbnail)
              return reorderedImages
            }
            return product.images
          })()
        : product.images

    return images.slice(...currentIndexImages)
  }, [product, currentIndexImages, selectedVariant])
  useEffect(() => {
    if (product && product.images.length > 0) {
      setActiveImage(product.images[0])
      // Reset to first image when product changes
      setCurrentIndexImages([0, 5])
    }
  }, [product])

  useEffect(() => {
    if (selectedVariant && selectedVariant.thumbnail) {
      setActiveImage(selectedVariant.thumbnail)
      // Reset to show thumbnail at the beginning
      setCurrentIndexImages([0, 5])
    } else {
      if (product && product.images.length > 0) {
        setActiveImage(product.images[0])
      }
    }
  }, [selectedVariant, product])

  useEffect(() => {
    if (product?.variantsConfig && product.variantsConfig.length > 0) {
      const initialOptions: Record<string, string> = {}
      product.variantsConfig.forEach((variant) => {
        if (variant.options.length > 0) {
          // If it's a default variant, set it to 'default', otherwise empty
          initialOptions[variant.type] = variant.type === 'default' ? 'default' : ''
        }
      })
      setSelectedVariantOptions(initialOptions)
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    const optionKeys = Object.keys(selectedVariantOptions)
    const allOptionsSelected = optionKeys.every((key) => selectedVariantOptions[key] !== '')

    if (!allOptionsSelected) {
      setSelectedVariant(null)
      setBuyCount(0)
      return
    }

    const selectedValue = Object.values(selectedVariantOptions).join(' / ')
    const variant = product.variants.find((v) => v.value === selectedValue)

    if (variant) {
      setSelectedVariant(variant)
      setBuyCount(1)
    }
  }, [selectedVariantOptions, product])

  const next = () => {
    if (currentIndexImages[1] < (product as ProductType).images.length) {
      setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }
  const prev = () => {
    if (currentIndexImages[0] > 0) {
      setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }
  const chooseActive = (img: string) => {
    setActiveImage(img)
  }

  const handleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  const handleSelectVariantOption = (type: string, option: string) => {
    setSelectedVariantOptions((prev) => {
      if (prev[type] === option) {
        const newOptions = {
          ...prev,
          [type]: ''
        }
        return newOptions
      }

      return {
        ...prev,
        [type]: option
      }
    })
    setErrorVariation('')
  }

  const validateVariantSelection = () => {
    if (!product?.variantsConfig || product.variantsConfig.length === 0) return true

    const hasEmptySelection = Object.values(selectedVariantOptions).some((value) => !value)
    if (hasEmptySelection) {
      setErrorVariation('Vui lòng chọn đầy đủ các thuộc tính sản phẩm')
      return false
    }

    return true
  }

  const addToCartMutation = useAddToCartMutation()
  const handleAddToCart = async () => {
    if (!validateVariantSelection() || addToCartMutation.isPending) return
    try {
      if (selectedVariant) {
        await addToCartMutation.mutateAsync({
          variantId: selectedVariant.id,
          quantity: buyCount
        })
        toast.success('Đã thêm sản phẩm vào giỏ hàng')
      }
      return
    } catch (error) {
      setIsOpenError(true)
      handleError(error)
    }
  }

  const handleBuyNow = () => {
    if (!validateVariantSelection()) return
    // Implement buy now functionality
  }

  if (!product) return <div>Loading...</div>
  return (
    <div className='bg-gray-100 py-6'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='bg-background p-4 shadow rounded-lg'>
          <div className='grid grid-cols-12 gap-9'>
            <div className='col-span-5'>
              <div className='relative w-full cursor-zoom-in overflow-hidden pt-[100%] shadow'>
                <img
                  src={activeImage || Config.ImageBaseUrl}
                  alt={product.name}
                  className='absolute top-0 left-0 h-full w-full bg-white object-contain'
                  ref={imageRef}
                  onClick={() => setIsOpenPreview(true)}
                />
              </div>
              <div className='relative mt-5 grid grid-cols-5 gap-1'>
                <button
                  className='absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                  onClick={prev}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                  </svg>
                </button>
                {currentImages.map((img) => {
                  const isActive = img === activeImage
                  return (
                    <div className='relative w-full pt-[100%]' key={img} onMouseEnter={() => chooseActive(img)}>
                      <img
                        src={img}
                        alt={product.name}
                        className='absolute top-0 left-0 h-full w-full cursor-pointer bg-white object-contain'
                      />
                      {isActive && <div className='absolute inset-0 border-2 border-primary' />}
                    </div>
                  )
                })}
                <button
                  className='absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                  onClick={next}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                  </svg>
                </button>
              </div>
            </div>
            <div className='col-span-7'>
              <div className='flex items-center gap-2'>
                <div>
                  {product.tags && product.tags.length > 0 && (
                    <div className='flex flex-wrap'>
                      {product.tags.map((tag) => {
                        let classNameStatus =
                          'capitalize bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300'
                        if (tag.type === TagType.Spice) {
                          classNameStatus =
                            'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300'
                        } else if (tag.type === TagType.Marketing) {
                          classNameStatus =
                            'bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300'
                        } else if (tag.type === TagType.Seasonal) {
                          classNameStatus =
                            'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300'
                        }

                        return (
                          <span key={tag.id} className={classNameStatus}>
                            {tag.name}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <h1 className='text-xl font-semibold'>{product.name}</h1>
              </div>

              <div className='mt-5 flex items-center'>
                <div className='capitalize text-gray-500'>Giá</div>
                <div className='ml-3 text-2xl font-medium text-red-600'>
                  {formatCurrency(selectedVariant ? selectedVariant.price : product.basePrice)}
                </div>
              </div>
              {product?.variantsConfig && product.variantsConfig.length > 0 && (
                <div className='mt-8'>
                  {product.variantsConfig.map((variantConfig) => (
                    <div key={variantConfig.type} className='mb-4'>
                      <div className='capitalize text-gray-500 mb-2'>{variantConfig.type}</div>
                      <div className='flex flex-wrap gap-3'>
                        {variantConfig.options.map((option) => (
                          <div
                            key={`${variantConfig.type}-${option}`}
                            className={`border px-6 py-1 text-sm rounded min-w-[60px] text-center flex items-center justify-center gap-2 transition duration-200 cursor-pointer relative overflow-hidden ${
                              selectedVariantOptions[variantConfig.type] === option
                                ? 'border-primary'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => handleSelectVariantOption(variantConfig.type, option)}
                          >
                            {variantConfig.type.toLowerCase() === 'màu sắc' ||
                            variantConfig.type.toLowerCase() === 'color' ? (
                              <div className='flex items-center gap-2'>
                                <div
                                  style={{
                                    backgroundColor: option.toLowerCase(),
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '100%',
                                    border: '1px solid #ddd'
                                  }}
                                ></div>
                                <div>{option}</div>
                              </div>
                            ) : (
                              <div>{option}</div>
                            )}
                            {selectedVariantOptions[variantConfig.type] === option && (
                              <div className='absolute -bottom-[1px] -right-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-t-[7px] border-t-transparent border-b-[7px] border-b-primary border-r-[7px] border-r-primary'></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{errorVariation}</div>
                </div>
              )}
              <div className='mt-2 flex items-center'>
                <div className='capitalize text-gray-500'>Số lượng</div>
                <div className={!selectedVariant || selectedVariant.stock <= 0 ? 'opacity-50 cursor-none' : ''}>
                  <QuantityController
                    onDecrease={handleBuyCount}
                    onIncrease={handleBuyCount}
                    onType={handleBuyCount}
                    value={selectedVariant ? (selectedVariant.stock === 0 ? 0 : buyCount) : 0}
                    max={selectedVariant ? selectedVariant.stock : 0}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                  />
                </div>
                <span className='ml-6 text-sm'>
                  {selectedVariant ? `${selectedVariant.stock} sản phẩm có sẵn` : <span>Chưa có sản phẩm nào</span>}
                </span>
              </div>
              <div className='mt-10 flex items-center'>
                <Button
                  onClick={handleAddToCart}
                  variant='outline'
                  className='flex h-12 items-center justify-center gap-2 rounded-sm border px-5 shadow-sm hover:scale-101 hover:border-primary hover:bg-white hover:text-primary'
                >
                  <ShoppingCart className='w-10 h-10 text-primary' />
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className='ml-4 h-12 gap-2 rounded-sm border px-5 shadow-sm hover:scale-101'
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className=' bg-white p-4 shadow rounded-lg'>
            <div className='rounded bg-gray-50 p-4 text-lg capitalize text-slate-700'>Mô tả sản phẩm</div>
            <div className='mx-4 mb-4 text-sm leading-loose'>
              <div
                dangerouslySetInnerHTML={{
                  __html: product.description || 'Chưa có mô tả sản phẩm'
                }}
                className='whitespace-pre-line'
              />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isOpenPreview} onOpenChange={setIsOpenPreview}>
        <DialogContent className='max-w-5xl p-1'>
          <div className='relative flex flex-col'>
            <div className='relative w-full pt-[60%] bg-white'>
              <img
                src={activeImage}
                alt={product?.name}
                className='absolute top-0 left-0 h-full w-full object-contain'
              />
            </div>
            <div className='mt-4 grid grid-cols-6 gap-2 px-6'>
              {product?.images.map((img) => {
                const isActive = img === activeImage
                return (
                  <div className='relative cursor-pointer pt-[100%]' key={img} onClick={() => chooseActive(img)}>
                    <img
                      src={img}
                      alt={product.name}
                      className='absolute top-0 left-0 h-full w-full bg-white object-contain'
                    />
                    {isActive && <div className='absolute inset-0 border-2 border-primary' />}
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isOpenError} onOpenChange={setIsOpenError}>
        <DialogContent className='max-w-5xl p-1'>
          <div className='relative flex flex-col p-6'>
            Bạn đã có {selectedVariant ? selectedVariant.stock : 0} sản phẩm này trong giỏ hàng. Không thể thêm số lượng
            đã chọn vào giỏ hàng vì sẽ vượt quá giới hạn mua hàng của bạn.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
