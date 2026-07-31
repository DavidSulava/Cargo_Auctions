export const auctionKeys = {
  all: () => ['auctions'] as const,
  lists: () => [...auctionKeys.all(), 'list'] as const,
  list: (filters: unknown) => [...auctionKeys.lists(), filters] as const,
  details: () => [...auctionKeys.all(), 'detail'] as const,
  detail: (uuid: string) => [...auctionKeys.details(), uuid] as const,
}

export const betKeys = {
  all: () => ['bets'] as const,
  list: (auctionUuid: string) => [...betKeys.all(), auctionUuid] as const,
}
