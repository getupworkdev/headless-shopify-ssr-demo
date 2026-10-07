// Builds absolute URLs from the origin resolved by the root loader.
type MatchLike = { loaderData?: unknown }

export function originFrom(matches: MatchLike[]): string {
  const data = matches[0]?.loaderData as { origin?: string } | undefined
  return data?.origin ?? ''
}

export function absolute(origin: string, path: string) {
  return `${origin}${path}`
}
