export function notImplemented(res, feature, endpoint) {
  return res.status(501).json({
    message: `${feature} endpoint not implemented yet`,
    feature,
    endpoint,
  })
}
