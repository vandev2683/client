import { useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { Dialog, DialogContent } from './ui/dialog'

export default function ImageUpload({
  files,
  setFiles,
  isMultiUpload = true,
  classNamePreview = 'relative group w-24 h-24 border rounded-lg overflow-hidden',
  classNameLabel = 'w-24 h-24 border-2 border-dashed flex flex-col justify-center items-center cursor-pointer'
}: {
  files: (File | string)[]
  setFiles: (files: (File | string)[]) => void
  isMultiUpload?: boolean
  classNamePreview?: string
  classNameLabel?: string
}) {
  // const [files, setFiles] = useState([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: any) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files) as File[]

      const uniqueNewFiles = newFiles.filter((newFile) => {
        return !files.some((existingFile) => {
          if (existingFile instanceof File) {
            return existingFile.name === newFile.name && existingFile.size === newFile.size
          }
          return false
        })
      })

      if (isMultiUpload) {
        setFiles([...files, ...uniqueNewFiles])
      } else {
        setFiles(uniqueNewFiles)
      }
      event.target.value = ''
    }
  }

  const handleDeleteImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <Dialog
        open={Boolean(selectedImage)}
        onOpenChange={() => {
          setSelectedImage(null)
        }}
      >
        <DialogContent className='flex items-center justify-center'>
          <img src={selectedImage as string} alt='Popup Preview' className='h-full object-contain' />
        </DialogContent>
      </Dialog>
      <div className='flex flex-wrap gap-4'>
        {files.map((file, index) => {
          if (typeof file === 'string') {
            return (
              <div key={index} className={classNamePreview}>
                <img src={file} alt='preview' className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-50 flex justify-center items-center gap-2'>
                  <div className='p-1 bg-white rounded-full hover:bg-gray-200' onClick={() => setSelectedImage(file)}>
                    <Eye size={16} />
                  </div>
                  <div
                    className='p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                    onClick={() => handleDeleteImage(index)}
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </div>
            )
          } else {
            return (
              <div key={index} className={classNamePreview}>
                <img src={URL.createObjectURL(file)} alt='preview' className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-50 flex justify-center items-center gap-2'>
                  <div
                    className='p-1 bg-white rounded-full hover:bg-gray-200'
                    onClick={() => setSelectedImage(URL.createObjectURL(file))}
                  >
                    <Eye size={16} />
                  </div>
                  <div
                    className='p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                    onClick={() => handleDeleteImage(index)}
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </div>
            )
          }
        })}
        {isMultiUpload && (
          <label className={classNameLabel}>
            <input type='file' multiple={isMultiUpload} className='hidden' onChange={handleImageUpload} />
            <span className='text-xl'>+</span>
            <span className='text-sm'>Upload</span>
          </label>
        )}
        {!isMultiUpload && files.length < 1 && (
          <label className={classNameLabel}>
            <input type='file' multiple={isMultiUpload} className='hidden' onChange={handleImageUpload} />
            <span className='text-xl'>+</span>
            <span className='text-sm'>Upload</span>
          </label>
        )}
      </div>
    </div>
  )
}
