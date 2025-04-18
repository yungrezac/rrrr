import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Users as UsersIcon, MessageCircle, Award, Ruler, Keyboard as Skateboarding } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  city: string;
  skates: string[];
  experience_years: number;
  skating_style: string[];
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes: number;
  created_at: string;
}

const DEFAULT_AVATAR = 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [id]);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          city,
          skates,
          experience_years,
          skating_style,
          created_at,
          posts:posts(count),
          followers:follows!follows_following_id_fkey(count),
          following:follows!follows_follower_id_fkey(count)
        `)
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Check if current user is following this profile
      const { data: isFollowingData, error: isFollowingError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .limit(1)
        .maybeSingle();

      if (isFollowingError && isFollowingError.code !== 'PGRST116') {
        throw isFollowingError;
      }

      setProfile({
        ...profileData,
        followers_count: profileData.followers[0]?.count || 0,
        following_count: profileData.following[0]?.count || 0,
        posts_count: profileData.posts[0]?.count || 0,
        is_following: !!isFollowingData,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserPosts() {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, content, image_url, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get likes count for each post
      const postsWithLikes = await Promise.all(
        posts.map(async (post) => {
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            likes: count || 0,
          };
        })
      );

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  }

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => router.push(`/post/${item.id}`)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      ) : (
        <View style={styles.postContent}>
          <Text numberOfLines={4} style={styles.postText}>{item.content}</Text>
        </View>
      )}
      <View style={styles.postStats}>
        <Text style={styles.postLikes}>{item.likes} likes</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: profile.full_name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: profile.avatar_url || DEFAULT_AVATAR }}
            style={styles.avatar}
          />

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.followers_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.posts_count}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.followButton,
                profile.is_following && styles.followingButton
              ]}
              onPress={async () => {
                try {
                  if (profile.is_following) {
                    await supabase
                      .from('follows')
                      .delete()
                      .match({ follower_id: (await supabase.auth.getUser()).data.user?.id, following_id: profile.id });
                  } else {
                    await supabase
                      .from('follows')
                      .insert({ follower_id: (await supabase.auth.getUser()).data.user?.id, following_id: profile.id });
                  }

                  setProfile({
                    ...profile,
                    followers_count: profile.is_following ? profile.followers_count - 1 : profile.followers_count + 1,
                    is_following: !profile.is_following,
                  });
                } catch (error) {
                  console.error('Error following user:', error);
                }
              }}
            >
              <Text style={styles.followButtonText}>
                {profile.is_following ? 'Отписаться' : 'Подписаться'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => router.push(`/chat/${profile.id}`)}
            >
              <MessageCircle size={20} color="white" />
              <Text style={styles.messageButtonText}>Сообщение</Text>
            </TouchableOpacity>
          </View>

          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.infoContainer}>
            {profile.city && (
              <View style={styles.infoItem}>
                <MapPin size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{profile.city}</Text>
              </View>
            )}

            {profile.experience_years > 0 && (
              <View style={styles.infoItem}>
                <Ruler size={16} color="#8E8E93" />
                <Text style={styles.infoText}>
                  Стаж катания: {profile.experience_years} {profile.experience_years === 1 ? 'год' : 'лет'}
                </Text>
              </View>
            )}

            <View style={styles.infoItem}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={styles.infoText}>
                На RollerMate с {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {profile.skates && profile.skates.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ролики</Text>
              <Skateboarding size={20} color="#007AFF" />
            </View>
            <View style={styles.tagsContainer}>
              {profile.skates.map((skate, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{skate}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.skating_style && profile.skating_style.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Стиль катания</Text>
              <Award size={20} color="#007AFF" />
            </View>
            <View style={styles.tagsContainer}>
              {profile.skating_style.map((style, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{style}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Posts</Text>
          </View>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: 'Inter-Regular',
  },
  headerButton: {
    marginLeft: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    color: '#1c1c1e',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 8,
  },
  followingButton: {
    backgroundColor: '#8E8E93',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  messageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  bio: {
    fontSize: 16,
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1c1c1e',
    fontFamily: 'Inter-SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  postsGrid: {
    marginTop: 8,
  },
  postCard: {
    flex: 1,
    margin: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f2f2f7',
  },
  postContent: {
    padding: 8,
    height: 150,
    justifyContent: 'center',
  },
  postText: {
    fontSize: 14,
    color: '#1c1c1e',
    fontFamily: 'Inter-Regular',
  },
  postStats: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  postLikes: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});