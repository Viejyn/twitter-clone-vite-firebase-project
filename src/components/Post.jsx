import moment from "moment/moment";
import "moment/locale/tr";
import { auth, db } from '../firebase/config';
import { AiOutlineHeart } from "react-icons/ai";
import { BiMessageRounded } from "react-icons/bi";
import { FaRetweet } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { FcLike } from "react-icons/fc";
import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, getDocs  } from "firebase/firestore";
import { useEffect, useState } from "react";
import Dropdown from "./Dropdown";

const Post = ({ tweet }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [isRetweeted, setIsRetweeted] = useState(false);


    // kaç gün önce atıldığını hesaplama
    const date = moment(tweet.createdAt?.toDate()).fromNow();

    // kullanıcının tweet i beğenip/beğenmediğine bakma
    useEffect(() => {
        const found = tweet.likes.find(
            (userId) => userId === auth.currentUser.uid 
        );

        setIsLiked(found)
    }, [tweet]);

    // tweet'i siler
    const handleDelete = async () => {
        if(confirm("Tweet'i silmeyi onaylıyor musunuz?")){
            // silmek istediğimiz belgenin referansını alma
            const docRef = doc(db, "tweets", tweet.id);
            // dokümanı silme
            await deleteDoc(docRef);
        }
    };

    // Yorumları Firestore'a ekleme
    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (comment.trim() === "") return;

        const commentRef = collection(db, "comments");

        await addDoc(commentRef, {
            tweetId: tweet.id,
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            text: comment,
            createdAt: new Date()
        });

        setComment("");
        fetchComments();
    };

    // Tweetin yorumlarını Firestore'dan çekme
    const fetchComments = async () => {
        const q = query(collection(db, "comments"), where("tweetId", "==", tweet.id));
        const querySnapshot = await getDocs(q);

        const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(fetchedComments);
    }

    // Retweet işlevi
    const toggleRetweet = async () => {
        const docRef = doc(db, "tweets", tweet.id);

        await updateDoc(docRef, {
            retweets: isRetweeted
                ? arrayRemove(auth.currentUser.uid)
                : arrayUnion(auth.currentUser.uid)
        });

        setIsRetweeted(!isRetweeted);
    };

    // Tweet yüklendiğinde yorumları al
    useEffect(() => {
        fetchComments();
    }, [tweet]);

    // like atmaya ve geri çekmeye yarar
    const toggleLike = async () => {
        // dokümanın referansını alma
        const docRef = doc(db, "tweets", tweet.id);

        await updateDoc(docRef, {           
            likes: isLiked
            // diziden aktif kullanıcının id'sini kaldırma
            ? arrayRemove(auth.currentUser.uid)
            // tweet'i beğenen kullanıcının id'sini diziye ekler
            : arrayUnion(auth.currentUser.uid),
        });
    };   

    const handleSave = (e) => {
        e.preventDefault();

        const tweetRef = doc(db, "tweets", tweet.id);

        updateDoc(tweetRef, {
            isEdited: true,
            textContent: e.target[0].value,
        });

        setIsEditMode(false);
    };

    return (
        <div className="flex gap-3 p-3 border-b[1] border-gray-600">
            <img 
              className="w-14 h-14 rounded-full" 
              src={tweet.user.photo} alt="user_picture" 
            />

            <div className="w-full">
                {/* üst kısım > kullanıcı bilgileri */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                        <p className="font-bold">{tweet.user.name}</p>
                        <p className="text-gray-400">
                            @{tweet.user.name.toLowerCase()}
                        </p>
                        <p className="text-gray-400">{date}</p>
                    </div>

                    {tweet.user.id === auth.currentUser.uid && ( 
                      <Dropdown 
                        handleDelete={handleDelete} 
                        handleEdit={() => setIsEditMode(true)} 
                      /> 
                    )}                    
                </div>
                {/* orta kısım > tweet içeriği  */}
                <div className="my-3">
                    { isEditMode ? ( 
                        <form className="flex gap-3" onSubmit={handleSave}>
                          <input className="text-black" type='text' defaultValue={tweet.textContent} /> 
                          <button type="button" onClick={() => setIsEditMode(false)}>Red</button>
                          <button type="submit">Kayıt</button>
                        </form>
                        ) : (
                          <p>{tweet?.textContent}</p>  
                        )                          
                    }
                    {/* eğer ki fotoğraf varsa ekrana bas */}
                    {tweet.imageContent && 
                    <img 
                      className="w-full object-contain max-h-[300px] mt-3 rounded-lg" 
                      src={tweet.imageContent} 
                    />}
                </div>
                {/* alt kısım > etkileşim butonları */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 items-center p-2 px-3 rounded-full transition cursor-pointer hover:bg-[#00a2ff6a]">
                        <BiMessageRounded />
                        <span>{comments.length}</span>
                    </div>

                    <div onClick={toggleRetweet} className="flex gap-1 items-center p-2 px-3 rounded-full transition cursor-pointer hover:bg-[#1eff0034]">
                        <FaRetweet color={isRetweeted ? "green" : "white"} />
                        <span>{tweet.retweets?.length || 0}</span>
                    </div>

                    <div onClick={toggleLike} className="flex gap-1 items-center p-2 px-3 rounded-full transition cursor-pointer hover:bg-[#ff26003e]">
                        {isLiked ? <FcLike /> : <AiOutlineHeart />} 
                        <span>{tweet.likes.length}</span>
                    </div>

                    <div className="flex gap-1 items-center p-2 px-3 rounded-full transition cursor-pointer hover:bg-[#4a515c3c]">
                        <FiShare2 />
                    </div>
                </div>

                {/* Yorum Yapma Alanı */}
                <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                    <input 
                        className="w-full p-2 text-black rounded bg-gray-200 outline-none"
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tweet'e yorum yaz..."
                    />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-full" type="submit">Yanıtla</button>
                </form>

                {/* Yorumları Listeleme */}
                <div className="mt-4">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-2 p-2 border-t border-gray-600">
                            <p className="text-sm font-bold">@{c.userName}</p>
                            <p>{c.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Post;