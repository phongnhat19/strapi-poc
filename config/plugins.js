module.exports = ({ env }) => ({
    upload: {
        provider: 'cloudinary',
        providerOptions: {
            cloud_name: env('CLOUDINARY_NAME') || 'gophuot',
            api_key: env('CLOUDINARY_KEY') || '269811349515945',
            api_secret: env('CLOUDINARY_SECRET') || 'Rh8jRkl4m8z8a',
        },
    },
});