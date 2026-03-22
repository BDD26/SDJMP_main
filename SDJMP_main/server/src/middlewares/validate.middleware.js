export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    })

    if (!result.success) {
      next(result.error)
      return
    }

    req.validated = result.data
    next()
  }
}
