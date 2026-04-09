const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Render ve Yerel ortam için Port ayarı
const PORT = process.env.PORT || 10000;

// EJS ve Klasör Yollarını Kesinleştirme (Beyaz Sayfa Çözümü)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Geçici Veri (Müşteri Dashboard için)
const businessData = {
    name: "GhostWrite AI Demo İşletmesi",
    reviews: [
        { id: 1, author: "Mert Yılmaz", rating: 5, text: "Hizmetten çok memnun kaldım, herkese tavsiye ederim.", date: "2 saat önce" },
        { id: 2, author: "Sarah Smith", rating: 4, text: "The food was great but the waiting time was a bit long.", date: "5 saat önce" }
    ]
};

// --- ROTALAR (ROUTES) ---

// 1. Ana Sayfa
app.get('/', (req, res) => {
    res.render('index');
});

// 2. Dashboard
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        businessName: businessData.name, 
        reviews: businessData.reviews 
    });
});

// 3. Fiyatlandırma (LemonSqueezy Linklerini Buraya Koyabilirsin)
app.get('/pricing', (req, res) => {
    res.render('pricing', {
        starterLink: "#", // Buraya LemonSqueezy linkini yapıştır
        proLink: "#"      // Buraya LemonSqueezy linkini yapıştır
    });
});

// 4. Ücretsiz Test Aracı
app.get('/free-tool', (req, res) => {
    res.render('free-tool');
});

// AI Cevap Üretme API'si
app.post('/generate-reply', async (req, res) => {
    const { reviewText, tone, specialInstructions } = req.body;
    
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `Sen bir SEO ve itibar yönetimi uzmanısın. Müşteri yorumuna ${tone} bir tonla cevap yaz. Ekstra talimat: ${specialInstructions}. Cevabın kısa, etkileyici ve SEO odaklı olsun.` 
                },
                { role: "user", content: reviewText }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true, reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("AI Hatası:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, reply: "AI şu an cevap üretemedi, lütfen tekrar deneyin." });
    }
});

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`🚀 GhostWrite AI Engine Active on Port ${PORT}`);
});
