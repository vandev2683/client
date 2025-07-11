import http from '@/lib/http'
import type {
  CreateReviewBodyType,
  GetAllReviewsQueryType,
  GetAllReviewsResType,
  GetReviewWithProductAndOrderQueryType,
  ReviewDetailType,
  ReviewType,
  UpdateReviewBodyType
} from '@/schemaValidations/review.schema'

const BASE_URL = '/reviews'

const reviewApis = {
  findAllByProductId: (query: GetAllReviewsQueryType) => {
    return http.get<GetAllReviewsResType>(`${BASE_URL}/all`, {
      params: query
    })
  },

  findWithProductAndOrderId(query: GetReviewWithProductAndOrderQueryType) {
    return http.get<ReviewDetailType>(BASE_URL, {
      params: query
    })
  },

  create(data: CreateReviewBodyType) {
    return http.post<ReviewType>(BASE_URL, data)
  },

  update(payload: { reviewId: number; body: UpdateReviewBodyType }) {
    const { reviewId, body } = payload
    return http.put<ReviewType>(`${BASE_URL}/${reviewId}`, body)
  },

  delete(reviewId: number) {
    return http.delete(`${BASE_URL}/${reviewId}`)
  }
}

export default reviewApis
