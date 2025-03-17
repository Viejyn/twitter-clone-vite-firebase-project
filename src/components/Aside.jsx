import React from "react";

const trends = [
    { title: "React.js", tweets: "120K Tweets" },
    { title: "Next.js 14", tweets: "85K Tweets" },
    { title: "Vite + React", tweets: "60K Tweets" },
    { title: "Tailwind CSS", tweets: "48K Tweets" },
];

const suggestedUsers = [
    { name: "Maya Angelou", username: "@mayaangelou", avatar: "/Maya.png" },
    { name: "Turgut Uyar", username: "@turgutuyar", avatar: "/Turgut.jpg" },
    { name: "Bill Gates", username: "@billgates", avatar: "/Bill.jpeg" },
];

const Aside = () => {
    return (
        <aside className="hidden lg:block w-[350px] p-4">
            {/* 🔍 Arama Çubuğu */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Ara"
                    className="w-full p-2 bg-gray-900 text-white rounded-full outline-none px-4"
                />
            </div>

            {/* 📈 Trendler */}
            <div className="bg-gray-900 p-4 rounded-xl mb-4">
                <h2 className="font-bold text-lg mb-3">İlgini Çekebilecek Gündemler</h2>
                {trends.map((trend, index) => (
                    <div key={index} className="mb-3 hover:bg-gray-800 p-2 rounded-lg cursor-pointer">
                        <p className="text-sm text-gray-400">{trend.tweets}</p>
                        <h3 className="font-bold">{trend.title}</h3>
                    </div>
                ))}
            </div>

            {/* 👥 Takip Önerileri */}
            <div className="bg-gray-900 p-4 rounded-xl">
                <h2 className="font-bold text-lg mb-3">Kimi Takip Etmeli?</h2>
                {suggestedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between mb-3 hover:bg-gray-800 p-2 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <h3 className="font-bold">{user.name}</h3>
                                <p className="text-sm text-gray-400">{user.username}</p>
                            </div>
                        </div>
                        <button className="bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
                            Takip Et
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Aside;
