'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const stripe = require('stripe')('sk_test_51IDw7QHYRruOoW8HxxnBDLeRPp1jRKPUdjsIk1fMwnZpWri1JjOkI3Q9QvkEmyShzr7CyXpcLZr48zzneMrWwbxc00uS2ph9EL');

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    /**
    * Create an order.
    *
    * @return {Object}
    */

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.orders.create(data, { files });
        } else {
            const body = ctx.request.body
            // Update required field
            body.order_status = 'PENDING'
            body.order_number = makeid(9)
            let existed = await strapi.models.orders.find({ order_number: body.order_number }).exec()
            while (existed.length > 0) {
                body.order_number = makeid(9)
                existed = await strapi.models.orders.find({ order_number: body.order_number }).exec()
            }

            // Calculate invoice amount
            let total = 0
            for (let index = 0; index < body.order_items.length; index++) {
                const item = body.order_items[index];
                const product = await strapi.models.product.findById(item.product);
                if (product) {
                    total += item.quantity * product.price
                }
            }
            body.invoice_amount = total

            if (body.payment_method === 'CREDIT_CARD') {
                const token = body.token
                if (!token) return ctx.badRequest('Invalid stripe token')
                try {
                    await stripe.charges.create({
                        // Transform cents to dollars.
                        amount: total * 100,
                        currency: 'usd',
                        description: `Order ${body.order_number}`,
                        source: token,
                    }); 
                    body.order_status = 'CONFIRMED'
                } catch (error) {
                    console.error(error)
                    return ctx.badRequest('Payment fail. Please retry')
                }
            }

            entity = await strapi.services.orders.create(body);
        }

        return sanitizeEntity(entity, { model: strapi.models.orders });
    },

    /**
    * Update an order.
    *
    * @return {Object}
    */

    async update(ctx) {
        const { id } = ctx.params;

        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.orders.update({ id }, data, {
                files,
            });
        } else {
            // Validate item availability
            const order = await strapi.models.orders.findById(id)
            const items = order.order_items || []
            if (ctx.request.body.order_status === 'CONFIRMED') {
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    const product = await strapi.models.product.findById(item.ref.product._id)
                    if (product.availability < item.ref.quantity) {
                        return ctx.badRequest(`Not enough item [${product.name}]`)
                    }
                }
            }

            entity = await strapi.services.orders.update({ id }, ctx.request.body);
        }

        if (entity.order_status === 'CONFIRMED') {
            const items = entity.order_items
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                const product = await strapi.models.product.findById(item.product.id)
                product.availability -= item.quantity
                await product.save()
            }
        } else if (entity.order_status === 'RETURNED') {
            const items = entity.order_items
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                const product = await strapi.models.product.findById(item.product.id)
                product.availability += item.quantity
                await product.save()
            }
        }

        return sanitizeEntity(entity, { model: strapi.models.orders });
    },
};
