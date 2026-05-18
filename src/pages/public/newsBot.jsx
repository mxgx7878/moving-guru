import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBb3veeBaRPAg0pRdE6aNlG5CI8WgfCAfY",
  authDomain: "news-bot-7ed57.firebaseapp.com",
  projectId: "news-bot-7ed57",
  storageBucket: "news-bot-7ed57.firebasestorage.app",
  messagingSenderId: "81987587816",
  appId: "1:81987587816:web:4f6ff8e55843ce7db2035d",
  measurementId: "G-D50GMRLDGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function NewsBotDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(data, "data")

      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">AI News Bot</h1>
            <p className="text-gray-400 mt-2">
              Firebase generated posts preview
            </p>
          </div>

          <button
            onClick={fetchPosts}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-semibold"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xl">
            No posts found in Firebase
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#111111] border border-gray-800 rounded-3xl overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-[320px] object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-5">
                    <span className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold">
                      {post.source || 'News Source'}
                    </span>

                    <h2 className="text-3xl font-extrabold leading-tight mt-3">
                      {post.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-300 whitespace-pre-line leading-7 text-[15px]">
                    {post?.caption.caption}
                  </p>

                  <div className="flex gap-3 mt-6">
                    <button className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-2xl font-semibold">
                      Publish
                    </button>

                    <button className="border border-gray-700 hover:border-gray-500 px-5 py-3 rounded-2xl">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
