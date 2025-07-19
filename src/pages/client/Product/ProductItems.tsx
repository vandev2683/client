import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router'
import Config from '@/constants/config'
import { ShoppingBag } from 'lucide-react'
import { formatCurrency, generateNameId, getHtmlPlainTextTitle, getIdByNameId } from '@/lib/utils'
import AutoPagination from '@/components/AutoPagination'
import { useQuery } from '@/hooks/useQuery'
import { useCategoryDetailQuery, useAllCategoriesQuery } from '@/queries/useCategory'
import { useEffect, useMemo } from 'react'
import { ProductStatus } from '@/constants/product'
import { Separator } from '@/components/ui/separator'
import type { ProductType } from '@/schemaValidations/product.schema'
import { categorySocket, productSocket, tagSocket } from '@/lib/sockets'
import type { MessageResType } from '@/schemaValidations/response.schema'
import { useAllProductsQuery } from '@/queries/useProduct'
import { useAppContext } from '@/components/AppProvider'

const PAGE_SIZE = 20
export default function ProductItems() {
  const { isAuth } = useAppContext()

  const query = useQuery()
  const currentPage = query.get('page') ? Number(query.get('page')) : 1
  const categoryId = query.get('category') ? Number(getIdByNameId(query.get('category') as string)) : undefined

  const categoryDetailQuery = useCategoryDetailQuery(categoryId)
  const categoryDetail = categoryDetailQuery.data?.data

  const { data: categories, refetch: refetchCategories } = useAllCategoriesQuery()

  const categoryIds = useMemo(() => {
    if (!categoryId) return []
    let ids: number[] = [categoryId]
    if (categoryDetail) {
      if (categoryDetail.parentCategoryId) {
        ids.push(Number(categoryDetail.parentCategoryId))
      }
      if (categoryDetail.childCategories && categoryDetail.childCategories.length > 0) {
        ids = ids.concat(categoryDetail.childCategories.map((child) => child.id))
      }
    }
    return ids
  }, [categoryDetail, categoryId])

  const { data, refetch } = useAllProductsQuery()
  const totalItems = data?.data.totalItems || 0

  useEffect(() => {
    if (isAuth) {
      productSocket.connect()
    } else {
      productSocket.disconnect()
      return
    }

    productSocket.on('sended-product', (data: MessageResType) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    productSocket.on('updated-product', (data: MessageResType) => {
      setTimeout(() => {
        refetch()
      }, 10)
    })

    return () => {
      productSocket.off('sended-product')
      productSocket.off('updated-product')
      productSocket.disconnect()
    }
  }, [isAuth, refetch])

  // Group products by parent categories when no category is selected
  const productsByCategory = useMemo(() => {
    const products = data?.data.data || []
    const allCategories = categories?.data.data || []

    if (categoryId) {
      // When category is selected, filter products as before
      if (categoryIds.length === 0) return { filtered: products, grouped: null }
      const filtered = products.filter((product) => {
        return product.categories.some((category) => categoryIds.includes(category.id))
      })
      return { filtered, grouped: null }
    }

    // When no category is selected, group by parent categories
    const parentCategories = allCategories.filter((cat) => !cat.parentCategoryId)
    const grouped = parentCategories
      .map((parentCategory) => {
        const categoryIds = [parentCategory.id]
        // Add child category IDs
        const childCategories = allCategories.filter((cat) => cat.parentCategoryId === parentCategory.id)
        categoryIds.push(...childCategories.map((child) => child.id))

        const categoryProducts = products
          .filter((product) => {
            return product.categories.some((category) => categoryIds.includes(category.id))
          })
          .filter((product) => product.status === ProductStatus.Available)

        return {
          category: parentCategory,
          products: categoryProducts
        }
      })
      .filter((group) => group.products.length > 0)

    return { filtered: products, grouped }
  }, [categoryIds, categoryId, categories?.data.data, data?.data.data])

  const filteredProducts = productsByCategory.filtered

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentItems = filteredProducts
    .filter((product) => product.status === ProductStatus.Available)
    .slice(startIndex, endIndex)

  // Render function for product card
  const renderProductCard = (product: ProductType) => (
    <Card key={product.id} className='overflow-hidden hover:scale-101 hover:shadow-sm transition-shadow pt-0'>
      <CardContent className='p-0'>
        <Link to={generateNameId({ name: product.name, id: product.id })} className='block p-0'>
          <div className='aspect-square overflow-hidden rounded-lg rounded-b-none w-full'>
            <img
              src={product.images[0] || Config.ImageBaseUrl}
              alt={product.name}
              className='w-full object-contain h-full'
            />
          </div>
          <Separator />
          <h2 className='px-4 text-md font-bold line-clamp-2 min-h-[3rem] mt-4 text-gray-600 capitalize'>
            {product.name}
          </h2>
          <div className='px-6 mb-2'>
            <div
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              className='overflow-hidden text-ellipsis whitespace-nowrap [&>*]:inline [&>*]:whitespace-nowrap [&>*]:overflow-hidden [&>*]:text-ellipsis text-sm text-gray-500 truncate'
              title={getHtmlPlainTextTitle(product.shortDescription)}
            />
          </div>
        </Link>

        <div className='px-4 flex justify-between items-center'>
          <span className='text-red-600 font-bold text-[1rem]'>{formatCurrency(product.basePrice)}</span>
          <div className='p-1 rounded-md cursor-pointer bg-primary text-white transition-colors'>
            <ShoppingBag className='w-6 h-6' />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      {/* Show products grouped by parent categories when no category is selected */}
      {!categoryId && productsByCategory.grouped ? (
        <div className='space-y-12'>
          {productsByCategory.grouped.map((categoryGroup) => (
            <div key={categoryGroup.category.id} className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-gray-800'>{categoryGroup.category.name}</h2>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                {categoryGroup.products.slice(0, 10).map(renderProductCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Show filtered products when category is selected */
        <>
          {/* Show category name when category is selected */}
          {categoryDetail && (
            <div className='mb-8'>
              <div className='flex items-center justify-between'>
                <h1 className='text-xl font-bold text-gray-600'>{categoryDetail.name}</h1>
                {/* <Link to='/' className='text-primary hover:text-primary/80 font-medium'>
                  ← Quay lại tất cả sản phẩm
                </Link> */}
              </div>
            </div>
          )}

          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8'>
            {currentItems.map(renderProductCard)}
          </div>

          <div>
            <AutoPagination page={currentPage} pageSize={Math.ceil(totalItems / PAGE_SIZE)} pathname='/' />
          </div>
        </>
      )}
    </div>
  )
}
