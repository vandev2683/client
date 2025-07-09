const Config = {
  BaseUrl: 'http://localhost:4000',
  Timeout: 10000,
  ImageBaseUrl:
    'https://nestjs-ecommerce-clone.s3.ap-southeast-1.amazonaws.com/images/600c2f59-c972-4d22-be09-e5112a82e92e.jpg',
  NoProductImage:
    'https://nestjs-ecommerce-clone.s3.ap-southeast-1.amazonaws.com/images/d0afc535-7521-4b50-b709-ecc6a7991179.png',
  VNPayIamgeUrl:
    'https://nestjs-ecommerce-clone.s3.ap-southeast-1.amazonaws.com/images/4bf73539-7e67-4eff-8b28-2750008df7a8.webp',
  MomoImageUrl:
    'https://nestjs-ecommerce-clone.s3.ap-southeast-1.amazonaws.com/images/962b99ab-fa96-420a-ac40-42642eb5bdc8.webp'
} as const

export default Config
