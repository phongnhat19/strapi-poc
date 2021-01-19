'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

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
            entity = await strapi.services.product.create(data, { files });
        } else {
            entity = await strapi.services.product.create(ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models.product });
    },
};
