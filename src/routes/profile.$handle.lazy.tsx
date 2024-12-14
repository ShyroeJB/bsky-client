import { createLazyFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/bluesky/hooks/useAuth';
import { useProfile } from '../lib/bluesky/hooks/useProfile';
import { Image } from '../components/ui/Image';
import { Debug } from '../components/ui/Debug';
import { useAuthorFeed } from '../lib/bluesky/hooks/useAuthorFeed';
import { PostCard } from '../components/PostCard';
import { BskyPost } from '../lib/bluesky/types';

export const Route = createLazyFileRoute('/profile/$handle')({
  component: Profile,
});

function Profile() {
  const { logout } = useAuth();
  const { handle } = Route.useParams();
  const { data: profile } = useProfile({ handle });
  const { data: feed } = useAuthorFeed({ handle });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 max-w-2xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col justify-between items-center">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
        <ErrorBoundary>
          <Image src={profile?.banner} alt="Banner" className="w-full h-32 object-cover" />
          <div>
            <Image src={profile?.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />
            <div>
              <h2 className="text-xl font-bold">{profile?.displayName}</h2>
              <p>{profile?.description}</p>
              <Debug value={profile} />
            </div>
          </div>
          {feed?.map(({ post }) => <PostCard key={post.uri} post={post as BskyPost} />)}
        </ErrorBoundary>
      </div>
    </div>
  );
}