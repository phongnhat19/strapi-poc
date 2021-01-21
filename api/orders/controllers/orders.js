'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

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

            entity = await strapi.services.orders.create(ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models.orders });
    },
};
