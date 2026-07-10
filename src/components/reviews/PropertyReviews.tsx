import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown, Reply, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  parent_id: string | null;
  likes: number;
  dislikes: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  replies?: Review[];
  user_reaction?: 'like' | 'dislike' | null;
}

interface PropertyReviewsProps {
  propertyId: string;
  propertyType?: 'estate' | 'listing';
}

const StarRating = ({ rating, onChange, size = 'md' }: { rating: number; onChange?: (r: number) => void; size?: 'sm' | 'md' }) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${sizeClass} cursor-pointer transition-colors ${
            star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );
};

const ReviewItem = ({
  review, onReply, onDelete, onReact, currentUserId, isAdmin, depth = 0
}: {
  review: Review;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
  onReact: (reviewId: string, reaction: 'like' | 'dislike') => void;
  currentUserId?: string;
  isAdmin: boolean;
  depth?: number;
}) => {
  const isOwn = currentUserId === review.user_id;
  const canDelete = isOwn || isAdmin;

  return (
    <div className={`${depth > 0 ? 'ml-6 md:ml-10 border-l-2 border-muted pl-4' : ''} mb-4`}>
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {(review.user_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{review.user_name || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
            </div>
          </div>
          {!review.parent_id && <StarRating rating={review.rating} size="sm" />}
        </div>

        <p className="text-sm text-foreground/90 mb-3">{review.review_text}</p>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => onReact(review.id, 'like')}
            className={`flex items-center gap-1 transition-colors ${review.user_reaction === 'like' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ThumbsUp className="h-3.5 w-3.5" /> {review.likes || 0}
          </button>
          <button
            onClick={() => onReact(review.id, 'dislike')}
            className={`flex items-center gap-1 transition-colors ${review.user_reaction === 'dislike' ? 'text-destructive font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ThumbsDown className="h-3.5 w-3.5" /> {review.dislikes || 0}
          </button>
          {currentUserId && (
            <button onClick={() => onReply(review.id)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Reply className="h-3.5 w-3.5" /> Reply
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(review.id)} className="flex items-center gap-1 text-muted-foreground hover:text-destructive ml-auto">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {review.replies?.map(reply => (
        <ReviewItem
          key={reply.id}
          review={reply}
          onReply={onReply}
          onDelete={onDelete}
          onReact={onReact}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

const PropertyReviews = ({ propertyId, propertyType = 'estate' }: PropertyReviewsProps) => {
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('*')
      .eq('property_id', propertyId)
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    // Fetch user profiles for names
    const userIds = [...new Set((data || []).map(r => r.user_id))];
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: p } = await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds);
      profiles = p || [];
    }

    // Fetch user reactions
    let userReactions: any[] = [];
    if (user) {
      const { data: r } = await supabase.from('review_reactions').select('*').eq('user_id', user.id);
      userReactions = r || [];
    }

    const enriched = (data || []).map(r => {
      const profile = profiles.find(p => p.id === r.user_id);
      const reaction = userReactions.find(ur => ur.review_id === r.id);
      return {
        ...r,
        user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'User',
        user_reaction: reaction?.reaction || null,
      };
    });

    // Build thread tree
    const topLevel = enriched.filter(r => !r.parent_id);
    const replies = enriched.filter(r => r.parent_id);
    const threaded = topLevel.map(r => ({
      ...r,
      replies: replies.filter(rep => rep.parent_id === r.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));

    setReviews(threaded);
    setLoading(false);
  }, [propertyId, propertyType, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in to leave a review'); return; }
    if (newRating === 0) { toast.error('Please select a rating'); return; }
    if (!newText.trim()) { toast.error('Please write a review'); return; }

    setSubmitting(true);
    const { error } = await supabase.from('property_reviews').insert({
      property_id: propertyId,
      property_type: propertyType,
      user_id: user.id,
      rating: newRating,
      review_text: newText.trim(),
    });

    if (error) toast.error('Failed to submit review');
    else { toast.success('Review submitted!'); setNewRating(0); setNewText(''); fetchReviews(); }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!user) { toast.error('Please log in to reply'); return; }
    if (!replyText.trim()) { toast.error('Please write a reply'); return; }

    setSubmitting(true);
    const parentReview = reviews.find(r => r.id === parentId);
    const { error } = await supabase.from('property_reviews').insert({
      property_id: propertyId,
      property_type: propertyType,
      user_id: user.id,
      rating: parentReview?.rating || 5,
      review_text: replyText.trim(),
      parent_id: parentId,
    });

    if (error) toast.error('Failed to submit reply');
    else { toast.success('Reply posted!'); setReplyTo(null); setReplyText(''); fetchReviews(); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('property_reviews').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted'); fetchReviews(); }
  };

  const handleReact = async (reviewId: string, reaction: 'like' | 'dislike') => {
    if (!user) { toast.error('Please log in to react'); return; }

    // Check existing reaction
    const { data: existing } = await supabase
      .from('review_reactions')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      if (existing.reaction === reaction) {
        // Remove reaction
        await supabase.from('review_reactions').delete().eq('id', existing.id);
        // Update count
        await supabase.from('property_reviews').update({
          [reaction === 'like' ? 'likes' : 'dislikes']: Math.max(0, (reviews.find(r => r.id === reviewId)?.[reaction === 'like' ? 'likes' : 'dislikes'] || 1) - 1)
        }).eq('id', reviewId);
      } else {
        // Switch reaction
        await supabase.from('review_reactions').update({ reaction }).eq('id', existing.id);
        const review = reviews.find(r => r.id === reviewId) || reviews.flatMap(r => r.replies || []).find(r => r.id === reviewId);
        if (review) {
          await supabase.from('property_reviews').update({
            likes: reaction === 'like' ? (review.likes || 0) + 1 : Math.max(0, (review.likes || 1) - 1),
            dislikes: reaction === 'dislike' ? (review.dislikes || 0) + 1 : Math.max(0, (review.dislikes || 1) - 1),
          }).eq('id', reviewId);
        }
      }
    } else {
      await supabase.from('review_reactions').insert({ review_id: reviewId, user_id: user.id, reaction });
      await supabase.from('property_reviews').update({
        [reaction === 'like' ? 'likes' : 'dislikes']: (reviews.find(r => r.id === reviewId)?.[reaction === 'like' ? 'likes' : 'dislikes'] || 0) + 1
      }).eq('id', reviewId);
    }
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{avgRating}</p>
          <StarRating rating={Math.round(Number(avgRating))} />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Write review */}
      {user && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Write a Review
          </h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Your rating:</span>
            <StarRating rating={newRating} onChange={setNewRating} />
          </div>
          <Textarea
            placeholder="Share your experience with this property..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            rows={3}
            className="mb-3"
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        reviews.map(review => (
          <div key={review.id}>
            <ReviewItem
              review={review}
              onReply={(id) => { setReplyTo(id); setReplyText(''); }}
              onDelete={handleDelete}
              onReact={handleReact}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
            {replyTo === review.id && (
              <div className="ml-6 md:ml-10 pl-4 mb-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={2}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReply(review.id)} disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PropertyReviews;
