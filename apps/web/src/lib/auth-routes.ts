function matchesRouteTree(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`)
}

export function isLoginPath(pathname: string) {
  return matchesRouteTree(pathname, '/login')
}

export function isSensitiveAuthPath(pathname: string) {
  return matchesRouteTree(pathname, '/auth')
}

export function isStandaloneAuthPath(pathname: string) {
  return isLoginPath(pathname) || isSensitiveAuthPath(pathname)
}
