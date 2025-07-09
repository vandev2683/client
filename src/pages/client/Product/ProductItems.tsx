import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router'
import Config from '@/constants/config'
import { ShoppingBag } from 'lucide-react'
import { formatCurrency, generateNameId, getIdByNameId } from '@/lib/utils'
import AutoPagination from '@/components/AutoPagination'
import { useAllProductsQuery } from '@/queries/useManageProduct'
import { useQuery } from '@/hooks/useQuery'
import { useCategoryDetailQuery } from '@/queries/useCategory'
import { useMemo } from 'react'

const PAGE_SIZE = 20
export default function ProductItems() {
  const query = useQuery()
  const currentPage = query.get('page') ? Number(query.get('page')) : 1
  const categoryId = query.get('category') ? Number(getIdByNameId(query.get('category') as string)) : undefined

  const categoryDetailQuery = useCategoryDetailQuery(categoryId)
  const categoryDetail = categoryDetailQuery.data?.data

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

  const productsQuery = useAllProductsQuery()
  const products = productsQuery.data?.data.data || []
  const totalItems = productsQuery.data?.data.totalItems || 0
  const filteredProducts = useMemo(() => {
    if (categoryIds.length === 0) return products
    return products.filter((product) => {
      return product.categories.some((category) => categoryIds.includes(category.id))
    })
  }, [products, categoryIds])

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentItems = filteredProducts.slice(startIndex, endIndex)

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8'>
        {currentItems.map((product) => (
          <Card key={product.id} className='overflow-hidden hover:scale-102 hover:shadow-sm transition-shadow pt-0'>
            <CardContent className='p-0'>
              <Link to={generateNameId({ name: product.name, id: product.id })} className='block mb-3'>
                <div className='aspect-square mb-3 overflow-hidden rounded-lg rounded-b-none'>
                  <img
                    src={product.images[0] || Config.ImageBaseUrl}
                    alt={product.name}
                    className='w-full object-contain'
                  />
                </div>

                <h2 className='px-4 text-[1rem] font-semibold line-clamp-2 min-h-[3rem]'>{product.name}</h2>
              </Link>

              <div className='px-4 flex justify-between items-center'>
                <span className='text-red-600 font-bold text-[1rem]'>{formatCurrency(product.basePrice)}</span>
                <div className='p-1 rounded-md cursor-pointer bg-primary text-white transition-colors'>
                  <ShoppingBag className='w-6 h-6' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <AutoPagination page={currentPage} pageSize={Math.ceil(totalItems / PAGE_SIZE)} pathname='/' />
      </div>
    </div>
  )
}
