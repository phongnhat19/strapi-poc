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
            entity = await strapi.services.orders.create(ctx.request.body);
        }

        // Update required field
        entity.order_status = 'PENDING'
        entity.order_number = makeid(9)

        let existed = await strapi.models.orders.find({ order_number: entity.order_number }).exec()
        while (existed.length > 0) {
            entity.order_number = makeid(9)
            existed = await strapi.models.orders.find({ order_number: entity.order_number }).exec()
        }

        return sanitizeEntity(entity, { model: strapi.models.orders });
    },
};
