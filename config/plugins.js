module.exports = ({ env }) => ({
    upload: {
        provider: 'cloudinary',
        providerOptions: {
            cloud_name: env('CLOUDINARY_NAME') || 'gophuot',
            api_key: env('CLOUDINARY_KEY') || '269811349515945',
            api_secret: env('CLOUDINARY_SECRET') || 'Rh8jRkl4m8z8a',
        },
    },
    email: {
        provider: 'sendgrid',
        providerOptions: {
            apiKey: env('SENDGRID_API_KEY') || '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',
        },
        settings: {
            defaultFrom: 'phongnhat19@gmail.com',
            defaultReplyTo: 'phongnhat19@gmail.com',
        },
    },
});