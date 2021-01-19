'use strict';

/**
 * `isVendorOwner` policy.
 */

module.exports = async (ctx, next) => {
  const vendor = ctx.request.body.vendor || ctx.request.params.vendor || ''

  if (!vendor) {
    return ctx.badRequest('Vendor is required')
  }

  // Validate vendor
  const existed = await strapi.models.vendors.exists({ _id: ctx.request.body.vendor })
  if (!existed) {
    return ctx.notFound(`Vendor not found`);
  }
  // Validate vendor owner
  const vendors = await strapi.models.vendors.find({ owner: ctx.state.user.id }).exec()
  let isOwner = vendors.filter((vendor) => vendor.id === ctx.request.body.vendor).length > 0
  if (!isOwner) {
    return ctx.unauthorized(`You are NOT owner`);
  }

  await next();
};
