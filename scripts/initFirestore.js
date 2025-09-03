import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXG4vrEosSJ7PBKEro7axBpFbt9JPNHbQ",
  authDomain: "thestreamerz.firebaseapp.com",
  projectId: "thestreamerz",
  storageBucket: "thestreamerz.firebasestorage.app",
  messagingSenderId: "548105710761",
  appId: "1:548105710761:web:ff3d4b592aaeb59f340db8",
  measurementId: "G-FNST998B6L"
};

const ADMIN_EMAIL = 'admin@thestreamerz.com';
const ADMIN_PASSWORD = 'Admin@007';

// Sample Data
const sampleContent = [
  {
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster_path: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/wTUf1QXQo4j0q0z1H6H5xY6Q7WS.jpg',
    release_date: '1994-09-23',
    vote_average: 9.3,
    genre_ids: [18],
    type: 'movie',
    featured: true,
    trending: true,
    custom_content: true
  },
  {
    title: 'Breaking Bad',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    poster_path: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    genre_ids: [18, 80],
    type: 'tv',
    featured: true,
    trending: true,
    custom_content: true
  },
  {
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    genre_ids: [28, 80, 18],
    type: 'movie',
    featured: false,
    trending: true,
    custom_content: true
  },
  {
    title: 'Stranger Things',
    overview: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
    poster_path: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.7,
    genre_ids: [18, 10765, 9648],
    type: 'tv',
    featured: false,
    trending: true,
    custom_content: true
  }
];

const sampleServers = [
  {
    name: 'Primary Streaming Server',
    baseUrl: 'https://stream1.thestreamerz.com',
    active: true,
    priority: 1,
    quality: '1080p',
    type: 'primary',
    description: 'Main streaming server for high-quality content'
  },
  {
    name: 'Backup Streaming Server',
    baseUrl: 'https://stream2.thestreamerz.com',
    active: true,
    priority: 2,
    quality: '720p',
    type: 'backup',
    description: 'Backup server for redundancy'
  },
  {
    name: 'CDN Server',
    baseUrl: 'https://cdn.thestreamerz.com',
    active: true,
    priority: 3,
    quality: 'adaptive',
    type: 'cdn',
    description: 'Content delivery network for global distribution'
  }
];

const siteSettings = {
  maintenanceMode: false,
  defaultQuality: '1080p',
  adFrequency: 3,
  maxConcurrentStreams: 5,
  enableComments: true,
  enableRatings: true,
  siteTitle: 'THE STREAMERZ',
  siteDescription: 'Your ultimate streaming platform for movies and TV shows',
  contactEmail: 'admin@streamerz.com',
  socialMedia: {
    twitter: 'https://twitter.com/thestreamerz',
    facebook: 'https://facebook.com/thestreamerz',
    instagram: 'https://instagram.com/thestreamerz'
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function initializeCMS() {
  console.log('🚀 Starting CMS initialization...');
  
  try {
    // Create admin account
    console.log('👤 Creating admin account...');
    try {
      const result = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('✅ Admin account created successfully');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Admin account already exists');
      } else {
        throw error;
      }
    }
    
    // Initialize data in batches
    console.log('📝 Initializing sample data...');
    const batch = writeBatch(db);
    
    // Add sample content
    sampleContent.forEach((content, index) => {
      const ref = doc(collection(db, 'customContent'));
      batch.set(ref, {
        ...content,
        created_at: new Date(),
        updated_at: new Date(),
        streaming_links: [
          `https://stream1.thestreamerz.com/play/${content.title.toLowerCase().replace(/\s+/g, '-')}`,
          `https://stream2.thestreamerz.com/play/${content.title.toLowerCase().replace(/\s+/g, '-')}`
        ]
      });
    });
    
    // Add streaming servers
    sampleServers.forEach((server, index) => {
      const ref = doc(collection(db, 'streamingServers'));
      batch.set(ref, {
        ...server,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
    
    // Add site settings
    const settingsRef = doc(db, 'siteSettings', 'configuration');
    batch.set(settingsRef, {
      ...siteSettings,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Commit all changes
    await batch.commit();
    console.log('✅ Sample data initialized successfully');
    
    // Create admin user document
    const adminUserRef = doc(db, 'users', 'admin-user');
    await setDoc(adminUserRef, {
      uid: 'admin-user',
      email: ADMIN_EMAIL,
      displayName: 'CMS Administrator',
      role: 'admin',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      permissions: ['read', 'write', 'delete', 'admin']
    });
    console.log('✅ Admin user document created');
    
    console.log('🎉 CMS initialization completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${sampleContent.length} content items added`);
    console.log(`   - ${sampleServers.length} streaming servers configured`);
    console.log(`   - Site settings configured`);
    console.log(`   - Admin account: ${ADMIN_EMAIL}`);
    console.log('🌐 Access your CMS at: https://thestreamerz.web.app/cms');
    
    return true;
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    return false;
  }
}

// Run initialization
initializeCMS().then(success => {
  if (success) {
    console.log('✅ Initialization completed successfully');
    process.exit(0);
  } else {
    console.log('❌ Initialization failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});