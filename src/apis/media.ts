import http from '@/lib/http'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import type { UploadFilesResType } from '@/schemaValidations/media.schema'

const mediaApis = {
  uploadFiles(body: FormData) {
    return http.post<UploadFilesResType>('/media/images/upload', body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default mediaApis
