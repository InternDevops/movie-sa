import { db, auth } from "../../firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// 🔹 Add movie to user's watchlist
export const addToWatchlist = async (movie) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const watchlistRef = doc(db, "watchlists", user.uid);

    // Add movie to Firestore
    await setDoc(
      watchlistRef,
      { movies: arrayUnion(movie) },
      { merge: true }
    );

    console.log("Movie added to watchlist!");
  } catch (error) {
    console.error("Error adding movie to watchlist:", error);
  }
};

// 🔹 Remove movie from watchlist
export const removeFromWatchlist = async (movieId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const watchlistRef = doc(db, "watchlists", user.uid);

    // Remove movie from Firestore
    await updateDoc(watchlistRef, {
      movies: arrayRemove({ id: movieId }),
    });

    console.log("Movie removed from watchlist!");
  } catch (error) {
    console.error("Error removing movie from watchlist:", error);
  }
};

// 🔹 Get user's watchlist
export const getWatchlist = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const watchlistRef = doc(db, "watchlists", user.uid);
    const watchlistSnap = await getDoc(watchlistRef);

    if (watchlistSnap.exists()) {
      return watchlistSnap.data().movies || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

