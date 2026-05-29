export function success(ctx, data = null, msg = 'success') {
  ctx.body = data;
}

export function fail(ctx, status, msg) {
  ctx.status = status;
  ctx.body = { code: status, msg, data: null };
}
