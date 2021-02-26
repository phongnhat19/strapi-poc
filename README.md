# Strapi application

## Prerequisition

1. NodeJS version 14
2. Create an `.env` file in root directory with the following content:
    ```
    CLOUDINARY_NAME=YOUR_CLOUDINARY_NAME
    CLOUDINARY_KEY=YOUR_CLOUDINARY_KEY
    CLOUDINARY_SECRET=YOUR_CLOUDINARY_SECRET
    ```
    *These information will be used to update image to [Cloudinary](https://cloudinary.com/)*

## Development

1. Install dependencies:
    ```bash
    npm install
    ```
2. Start dev server:
    ```bash
    npm run develop
    ```

## Prodcution

1. Install dependencies:
    ```bash
    npm install
    ```
2. Build:
    ```bash
    npm run build
    ```
3. Start server
    ```bash
    npm start
    ```