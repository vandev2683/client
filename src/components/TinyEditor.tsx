import { Editor } from '@tinymce/tinymce-react'

interface TinyMCEEditorProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

export default function TinyEditor({ value, onChange }: TinyMCEEditorProps) {
  return (
    <Editor
      apiKey='bkz4hadgd1122xtshfn8t62a4frelcalb63w1ajzt1ssgs1o'
      value={value}
      onEditorChange={(newValue) => onChange(newValue)}
      init={{
        height: 150,
        menubar: false,
        plugins: ['lists'],
        toolbar:
          'undo redo | bold italic underline | \
          bullist numlist | \
          alignleft aligncenter alignright alignjustify',
        toolbar_mode: 'sliding',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  )
}
