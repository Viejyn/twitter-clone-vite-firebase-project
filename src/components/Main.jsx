import { useEffect, useState } from "react";
import Form from "../components/Form";
import Post from "../components/Post";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import Loading from "./Loading";

const Main = ({ user }) => {
    const [tweets, setTweets] = useState(null);
    const tweetsCol = collection(db, 'tweets');

    useEffect(() => {
        // filtreleme ayarları tanımlama
        const options = query(tweetsCol, orderBy('createdAt', 'desc'));

        onSnapshot(options, (snapshot) => {
            // tweet leri geçici olarak tuttuğumuz dizi
            const tempTweets = [];
            // her bir dokümanın verisine erişip, diziye aktar
            snapshot.forEach((doc) => {
                tempTweets.push({ ...doc.data(), id: doc.id });          
            });
            // verileri state'e aktarma
            setTweets(tempTweets);
        });
    }, []);

    return (
        <main className="border border-gray-700 overflow-y-auto">
            <header className="font-bold p-4 border-b-[1px] border-gray-700">Anasayfa</header>
            <Form user={user} />

            {!tweets ? (
             <Loading /> 
            ) : (
             tweets.map((tweet) => <Post key={tweet.id} tweet={tweet} /> ) 
            )}
        </main>
    );
};

export default Main;