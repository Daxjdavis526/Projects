/**
 * Plain-English descriptions of every OAuth permission SPOTTER asks for, so
 * the Connections page can say exactly what was granted and why. All are
 * read-only: SPOTTER never posts, edits or deletes anything.
 */
export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'https://www.googleapis.com/auth/youtube.readonly': 'See your channel, your video list and each video’s public stats',
  'https://www.googleapis.com/auth/yt-analytics.readonly': 'Read YouTube Analytics for your channel (views, watch time, subscribers by day)',
  instagram_business_basic: 'Read your professional account’s profile and posts',
  instagram_business_manage_insights: 'Read insights (reach, views, saves, shares) for your account and posts',
  instagram_basic: 'Read your Instagram account’s profile and posts',
  instagram_manage_insights: 'Read insights for your Instagram account and posts, and look up other professional accounts by username (Business Discovery)',
  pages_show_list: 'See which Facebook Pages you manage (to find the linked Instagram account)',
  pages_read_engagement: 'Read the linked Page’s basic data (required by Meta for the Instagram account link)',
  'user.info.basic': 'See your TikTok display name and avatar',
  'user.info.profile': 'See your TikTok username, bio and profile link',
  'user.info.stats': 'See your follower, following, like and video counts',
  'video.list': 'See your public TikTok videos and their view, like, comment and share counts',
}

export function describeScope(scope: string): string {
  return SCOPE_DESCRIPTIONS[scope] ?? scope
}
