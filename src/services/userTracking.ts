import { db } from '../firebase/config';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface WatchHistory {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  watchedAt: Date;
  duration: number; // in minutes
  completed: boolean;
}

export interface UserStats {
  moviesWatched: number;
  tvShowsWatched: number;
  totalHoursWatched: number;
  lastUpdated: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  addedAt: Date;
}

export interface UserRating {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  rating: number; // 1-5 stars
  ratedAt: Date;
}

class UserTrackingService {
  // Track when user watches content
  async trackWatch(userId: string, content: any, contentType: 'movie' | 'tv', duration: number = 0, completed: boolean = false) {
    try {
      const watchData: Omit<WatchHistory, 'id'> = {
        userId,
        contentId: content.id.toString(),
        contentType,
        title: content.title || content.name,
        posterPath: content.poster_path || '',
        watchedAt: new Date(),
        duration,
        completed
      };

      // Add to watch history
      await addDoc(collection(db, 'watchHistory'), watchData);

      // Update user statistics
      await this.updateUserStats(userId, contentType, duration);

      console.log('Watch tracked successfully');
    } catch (error) {
      console.error('Error tracking watch:', error);
    }
  }

  // Update user statistics
  async updateUserStats(userId: string, contentType: 'movie' | 'tv', duration: number = 0) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentStats = userData.stats || {
          moviesWatched: 0,
          tvShowsWatched: 0,
          totalHoursWatched: 0,
          lastUpdated: new Date()
        };

        const newStats = {
          ...currentStats,
          moviesWatched: contentType === 'movie' ? currentStats.moviesWatched + 1 : currentStats.moviesWatched,
          tvShowsWatched: contentType === 'tv' ? currentStats.tvShowsWatched + 1 : currentStats.tvShowsWatched,
          totalHoursWatched: currentStats.totalHoursWatched + (duration / 60), // Convert minutes to hours
          lastUpdated: new Date()
        };

        await updateDoc(userRef, {
          stats: newStats,
          lastActivity: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.stats || {
          moviesWatched: 0,
          tvShowsWatched: 0,
          totalHoursWatched: 0,
          lastUpdated: new Date()
        };
      }
      
      return {
        moviesWatched: 0,
        tvShowsWatched: 0,
        totalHoursWatched: 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        moviesWatched: 0,
        tvShowsWatched: 0,
        totalHoursWatched: 0,
        lastUpdated: new Date()
      };
    }
  }

  // Get user watch history
  async getWatchHistory(userId: string, limitCount: number = 20): Promise<WatchHistory[]> {
    try {
      const q = query(
        collection(db, 'watchHistory'),
        where('userId', '==', userId),
        orderBy('watchedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        watchedAt: doc.data().watchedAt.toDate()
      })) as WatchHistory[];
    } catch (error) {
      console.error('Error getting watch history:', error);
      return [];
    }
  }

  // Add to watchlist
  async addToWatchlist(userId: string, content: any, contentType: 'movie' | 'tv') {
    try {
      const watchlistData: Omit<WatchlistItem, 'id'> = {
        userId,
        contentId: content.id.toString(),
        contentType,
        title: content.title || content.name,
        posterPath: content.poster_path || '',
        addedAt: new Date()
      };

      await addDoc(collection(db, 'watchlist'), watchlistData);
      console.log('Added to watchlist successfully');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  }

  // Get user watchlist
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const q = query(
        collection(db, 'watchlist'),
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt.toDate()
      })) as WatchlistItem[];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  // Add user rating
  async addRating(userId: string, content: any, contentType: 'movie' | 'tv', rating: number) {
    try {
      const ratingData: Omit<UserRating, 'id'> = {
        userId,
        contentId: content.id.toString(),
        contentType,
        title: content.title || content.name,
        posterPath: content.poster_path || '',
        rating,
        ratedAt: new Date()
      };

      await addDoc(collection(db, 'ratings'), ratingData);
      console.log('Rating added successfully');
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  }

  // Get user ratings
  async getUserRatings(userId: string): Promise<UserRating[]> {
    try {
      const q = query(
        collection(db, 'ratings'),
        where('userId', '==', userId),
        orderBy('ratedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        ratedAt: doc.data().ratedAt.toDate()
      })) as UserRating[];
    } catch (error) {
      console.error('Error getting user ratings:', error);
      return [];
    }
  }
}

export const userTrackingService = new UserTrackingService();
