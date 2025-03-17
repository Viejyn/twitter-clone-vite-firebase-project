import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, provider } from "../firebase/config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AuthPage = () => {
    const navigate = useNavigate();
    const [signUp, setSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorCode, setErrorCode] = useState("");

    // kullanıcının hesabı daha önce açıksa
    useEffect(() => {
        if(auth.currentUser) {
            navigate('/feed');
        }
    }, []);

    // formun gönderilme olayı
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorCode("");

        const email = e.target[0].value.trim();
        const pass = e.target[1].value.trim();

        if(!email || !pass) {
            toast.error("Lütfen e-posta ve şifre alanlarını doldurun.");
            return;
        }

        if(signUp) {
            // yeni hesap oluştur
            try {
                await createUserWithEmailAndPassword(auth, email, pass);
                navigate("/feed");
                toast.success("Hesabınız oluşturuldu");
            } catch (err) {
                toast.error(`Üzgünüz, bir hata oluştu: ${err.code}`);
                setErrorCode(err.code);
            }
        } else {
            // varolan hesaba giriş yap
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                navigate("/feed");
                toast.success("Hesaba giriş yapıldı");
            } catch (err) {
                console.error("Firebase Auth Hatası:", err);

                // Eğer hata şifre ile ilgiliyse errorCode'u ayarla
                if (err.code === "auth/invalid-credential") {
                    setErrorCode(err.code);
                }
                
                toast.error(`Üzgünüz bir hata oluştu: ${err.code}`);
            }   
        }
    };

    // google ile giriş
    const handleGoogle = async () => {
        try {
            await signInWithPopup(auth, provider);

            toast.success('Google hesabınız ile giriş yapıldı');
            navigate('/feed');
        } catch (err) { 
            console.log(err); 
        }
    };       

    // şifre sıfırlama e-postası gönderir
    const handleReset = () => {
        if (!email) {
            toast.error("Lütfen önce e-posta adresinizi girin!");
            return;
        }

        sendPasswordResetEmail(auth, email)
        .then(() => {
            toast.info(`${email} adresine şifre sıfırlama e-postası gönderildi.`);
        })
        .catch((error) => {
            toast.error(`Üzgünüz, bir hata oluştu: ${error.code}`);
        });
    };

    return (
        <section className="h-screen grid place-items-center">
            <div className="bg-black flex flex-col gap-10 py-16 px-32 rounded-lg">
                <div className="flex justify-center">
                    <img className="h-[60px]" src="/x-logoo.webp" alt="twitter-logo" />
                </div>
                
                <h1 className="text-center font-bold text-xl">Twitter'a Giriş Yap</h1>

                {/* Google ile Giriş Butonu */}
                <div onClick={handleGoogle} className="flex items-center bg-white py-2 px-10 rounded-full cursor-pointer gap-3 text-black hover:bg-gray-300">
                    <img className="h-[20px]" src="/google-logoo.svg" alt="google-logo" />
                    <span className="whitespace-nowrap">Google ile Giriş Yap</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label>Email</label>
                    <input 
                      className="text-black rounded mt-1 p-2 outline-none shadow-lg focus:shadow-[gray]" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />

                    <label className="mt-5">Şifre</label>
                    <input 
                      className="text-black rounded mt-1 p-2 outline-none shadow-lg focus:shadow-[gray]" 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />

                    <button className="bg-white text-black mt-10 rounded-full p-1 font-bold transition hover:bg-gray-300">
                        {signUp ? 'Kayıt Olun' : 'Giriş Yapın'}
                    </button>

                    <p className="mt-5 flex gap-4">
                        <span className="text-gray-500">
                            {signUp ? 'Hesabınız varsa' : 'Hesabınız yoksa'}
                        </span>

                        <span 
                          onClick={() => setSignUp(!signUp)} 
                          className="cursor-pointer text-blue-500"
                        >
                          {signUp ? 'Giriş Yapın' : 'Kayıt Olun'}
                        </span>
                    </p>
                </form>

                {/* Şifreden kaynaklı hata varsa göster */}
                {errorCode === "auth/invalid-credential" && (
                    <p onClick={handleReset} className="text-red-400 cursor-pointer text-center">
                        Şifrenizi mi unuttunuz?
                    </p>
                )}               
            </div>
        </section>
    );
};

export default AuthPage;