// app/(main)/[username]/followers/page.tsx
import { getFollowers } from "@/lib/actions/follow"
import { getUserByUsername } from "@/lib/actions/user"
import UserList from "@/components/profile/UserList"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    username: string
  }>
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user) {
    notFound()
  }

  const followers = await getFollowers(user.id)

  return (
    <div className="max-w-4xl mx-auto py-24 px-6">
      <UserList users={followers} title="Signal_Observers" />
    </div>
  )
}
