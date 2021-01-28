'use strict';

/**
 * `isVendorOwner` policy.
 */

module.exports = async (ctx, next) => {
  let vendor
  if (ctx.is('multipart')) {
    const { data } = parseMultipartData(ctx);
    vendor = data.vendor || ''
  } else {
    vendor = ctx.request.body.vendor || ctx.params.vendor || ''
  }

  if (vendor === '') {
    const orderId = ctx.params.id || ''
    if (!orderId) return ctx.badRequest('Vendor is required')
    const order = await strapi.models.orders.findById(orderId).exec()
    if (!order) return ctx.badRequest('Vendor is required')
    vendor = order.vendor.toString()
  }

  if (!vendor) {
    return ctx.badRequest('Vendor is required')
  }

  // Validate vendor
  const existed = await strapi.models.vendors.exists({ _id: vendor })
  if (!existed) {
    return ctx.notFound(`Vendor not found`);
  }
  // Validate vendor owner
  const vendors = await strapi.models.vendors.find({ owner: ctx.state.user.id }).exec()
  let isOwner = vendors.filter((vendorObj) => vendorObj.id === vendor).length > 0
  if (!isOwner) {
    return ctx.unauthorized(`You are NOT owner`);
  }

  await next();
};
