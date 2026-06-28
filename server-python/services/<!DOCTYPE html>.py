<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Happy Birthday Piyush</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color-1: #e0f2fe;
            --bg-color-2: #bae6fd;
            --bg-color-3: #7dd3fc;
            --text-main: #0284c7;
            --white: #ffffff;
            --silver: #e2e8f0;
            --glass-bg: rgba(255, 255, 255, 0.4);
            --glass-border: rgba(255, 255, 255, 0.6);
            --glow-cyan: rgba(125, 211, 252, 0.6);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
            scroll-behavior: smooth;
        }

        body {
            background: linear-gradient(-45deg, var(--bg-color-1), var(--bg-color-2), var(--bg-color-3), var(--white));
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            color: var(--text-main);
            overflow-x: hidden;
            cursor: default;
        }

        /* Animated Background */
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Particles Canvas */
        #particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
        }

        /* Glassmorphism Utility */
        .glass {
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            box-shadow: 0 8px 32px var(--glow-cyan);
        }

        /* Loading Screen */
        #loader {
            position: fixed;
            inset: 0;
            background: var(--bg-color-1);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 1s ease;
        }
        .loader-text {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            color: var(--text-main);
            animation: pulse 1.5s infinite;
        }

        /* Floating Music Button */
        #music-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 1000;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        #music-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 0 20px var(--white);
        }

        section {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 4rem 2rem;
            position: relative;
        }

        /* Typography & Glow */
        h1, h2 {
            font-family: 'Playfair Display', serif;
            text-align: center;
            text-shadow: 0 0 15px var(--white), 0 0 30px var(--glow-cyan);
        }

        h1 { font-size: 4rem; margin-bottom: 1rem; }
        h2 { font-size: 3rem; margin-bottom: 2rem; }
        p { font-size: 1.2rem; text-align: center; max-width: 800px; line-height: 1.8; }

        /* Buttons */
        .btn {
            padding: 15px 40px;
            font-size: 1.2rem;
            color: var(--text-main);
            text-decoration: none;
            border-radius: 30px;
            margin-top: 2rem;
            display: inline-block;
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid var(--glass-border);
        }
        .btn::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            transition: left 0.5s;
        }
        .btn:hover::before { left: 100%; }
        .btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px var(--glow-cyan);
        }

        /* Scroll Reveal Classes */
        .reveal {
            opacity: 0;
            transform: translateY(50px);
            transition: all 1s ease-out;
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        /* Memories Timeline */
        .timeline {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            justify-content: center;
            max-width: 1200px;
        }
        .memory-card {
            width: 300px;
            padding: 2rem;
            text-align: center;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .memory-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(255,255,255,0.8);
        }
        .memory-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #0369a1; }
        
        /* Emotional Message */
        .message-box {
            padding: 4rem;
            max-width: 800px;
            position: relative;
        }
        .typing-text {
            font-size: 1.5rem;
            font-style: italic;
            border-right: 2px solid var(--text-main);
            white-space: pre-wrap;
            display: inline-block;
            animation: blinkCursor 0.7s infinite;
        }
        @keyframes blinkCursor {
            50% { border-color: transparent; }
        }

        /* Gallery */
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            width: 100%;
            max-width: 1000px;
        }
        .gallery-item {
            position: relative;
            height: 250px;
            border-radius: 15px;
            overflow: hidden;
            cursor: pointer;
        }
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .gallery-item:hover img {
            transform: scale(1.1);
        }
        .gallery-caption {
            position: absolute;
            bottom: -100%;
            left: 0;
            width: 100%;
            padding: 1rem;
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(5px);
            transition: bottom 0.4s ease;
            text-align: center;
            font-weight: 500;
        }
        .gallery-item:hover .gallery-caption {
            bottom: 0;
        }

        /* Surprise Section */
        #surprise-screen {
            position: fixed;
            inset: 0;
            background: rgba(224, 242, 254, 0.95);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 1s ease;
        }
        .cake { font-size: 8rem; animation: bounce 2s infinite; }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }

        /* Final Exit Screen Overlay */
        #final-curtain {
            position: fixed;
            inset: 0;
            background: #0f172a; /* Deep elegant dark blue/black */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 2s ease-in-out;
            color: #e2e8f0;
        }
        #final-curtain h1 {
            color: #bae6fd;
            text-shadow: none;
        }

        /* Footer */
        footer {
            padding: 2rem;
            text-align: center;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
        }

        /* Responsive */
        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            h2 { font-size: 2rem; }
            .message-box { padding: 2rem; }
        }
    </style>
</head>
<body>

    <div id="loader">
        <div class="loader-text">Preparing Memories...</div>
    </div>

    <canvas id="particles"></canvas>

    <audio id="bg-music" loop>
        <source src=night.mp3 type="audio/mpeg">
    </audio>
    <button id="music-btn" class="glass" onclick="toggleMusic()">🎵</button>

    <section id="home">
        <h1 class="reveal">Happy Birthday Piyush 🎂</h1>
        <p class="reveal" style="transition-delay: 0.2s;">To the best friend who made life more memorable.</p>
        <a href="#memories" class="btn glass reveal" style="transition-delay: 0.4s;">Start Journey</a>
    </section>

    <section id="memories">
        <h2 class="reveal">Our Timeline</h2>
        <div class="timeline">
            <div class="memory-card glass reveal">
                <h3>School Days</h3>
                <p>Where it all started. Desks, laughter, and zero worries about the real world.</p>
            </div>
            <div class="memory-card glass reveal" style="transition-delay: 0.2s;">
                <h3>Crazy Moments</h3>
                <p>The inside jokes and chaotic adventures that only we understand.</p>
            </div>
            <div class="memory-card glass reveal" style="transition-delay: 0.4s;">
                <h3>Late Night Talks</h3>
                <p>Hours of talking about everything and nothing when sleep was optional.</p>
            </div>
            <div class="memory-card glass reveal" style="transition-delay: 0.6s;">
                <h3>Support System</h3>
                <p>Standing like a backbone during hard times. Never alone, always together.</p>
            </div>
        </div>
    </section>

    <section id="message">
        <div class="message-box glass reveal">
            <h2>A Message For You</h2>
            <div id="typed-container" class="typing-text"></div>
        </div>
    </section>

    <section id="gallery">
        <h2 class="reveal">Captured Magic</h2>
        <div class="gallery">
            <div class="gallery-item glass reveal">
                <img src="img1.jpg" alt="Memory 1">
                <div class="gallery-caption">Unforgettable Days</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img2.jpg" alt="Memory 2">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.4s;">
                <img src="img3.jpg" alt="Memory 3">
                <div class="gallery-caption">Future Dreams Together</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img4.jpg" alt="Memory 4">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img5.jpg" alt="Memory 5">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img6.jpg" alt="Memory 6">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img7.jpg" alt="Memory 7">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>
            <div class="gallery-item glass reveal" style="transition-delay: 0.2s;">
                <img src="img8.jpg" alt="Memory 8">
                <div class="gallery-caption">Through Thick and Thin</div>
            </div>

        </div>
    </section>

    <section id="final">
        <h1 class="reveal">Happy Birthday Once Again Piyush</h1>
        <p class="reveal" style="font-size: 1.5rem; margin-bottom: 2rem;">May your future shine brighter than today.</p>
        <button class="btn glass reveal" onclick="triggerSurprise()">Open Your Gift</button>
    </section>

    <section id="exit">
        <h2 class="reveal">End of the Journey</h2>
        <p class="reveal" style="margin-bottom: 2rem; transition-delay: 0.2s;">Some memories are made online, but the best ones are made together.</p>
        <button class="btn glass reveal" onclick="closeWebsite()" style="transition-delay: 0.4s; color: #dc2626;">Close Website ✖</button>
    </section>

    <footer>
        <p>"Many people come and go, but there’s only one you."</p>
    </footer>

    <div id="surprise-screen">
        <div class="cake">🎂</div>
        <h1>You are not just a friend.</h1>
        <h1 style="color: #0369a1;">You are family 💙</h1>
        <button class="btn glass" onclick="closeSurprise()" style="margin-top: 30px;">Continue</button>
    </div>

    <div id="final-curtain">
        <h1>The End.</h1>
        <p style="margin-top: 20px; font-style: italic;">You can safely close this tab now.</p>
    </div>

    <script>
        // 1. Remove Loader
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);
            }, 1500);
        });

        // 2. Scroll Reveal Animation
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.classList.contains('message-box') && !window.typed) {
                        typeMessage();
                        window.typed = true;
                    }
                }
            });
        }, { threshold: 0.2 });
        revealElements.forEach(el => revealObserver.observe(el));

        // 3. Typing Effect
        const messageText = "Thank you for always being there.\nYou are one of the most important people in my life.\nNo matter what happens, our friendship stays forever.\n\n— Vaibhav";
        let charIndex = 0;
        function typeMessage() {
            const container = document.getElementById('typed-container');
            if (charIndex < messageText.length) {
                container.textContent += messageText.charAt(charIndex);
                charIndex++;
                setTimeout(typeMessage, 50);
            }
        }

        // 4. Music Toggle
        const music = document.getElementById('bg-music');
        let isPlaying = false;
        function toggleMusic() {
            if (isPlaying) {
                music.pause();
                document.getElementById('music-btn').textContent = '🎵';
            } else {
                music.play().catch(e => console.log("Add a valid audio source in the HTML file!"));
                document.getElementById('music-btn').textContent = '⏸️';
            }
            isPlaying = !isPlaying;
        }

        // 5. Surprise Logic & Confetti
        function triggerSurprise() {
            const screen = document.getElementById('surprise-screen');
            screen.style.display = 'flex';
            setTimeout(() => {
                screen.style.opacity = '1';
                createConfetti();
            }, 10);
        }

        function closeSurprise() {
            const screen = document.getElementById('surprise-screen');
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.style.display = 'none';
                // Automatically scroll down to the exit section after closing surprise
                document.getElementById('exit').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }

        function createConfetti() {
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = ['#7dd3fc', '#ffffff', '#e2e8f0', '#0284c7'][Math.floor(Math.random() * 4)];
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.zIndex = '2001';
                confetti.style.pointerEvents = 'none';
                
                const animDuration = Math.random() * 3 + 2;
                confetti.animate([
                    { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate3d(${Math.random()*200 - 100}px, 100vh, 0) rotate(${Math.random()*720}deg)`, opacity: 0 }
                ], { duration: animDuration * 1000, easing: 'cubic-bezier(.37,0,.63,1)' });

                document.getElementById('surprise-screen').appendChild(confetti);
                setTimeout(() => confetti.remove(), animDuration * 1000);
            }
        }

        // 6. Close Website Logic
        function closeWebsite() {
            // First, try the standard window close command.
            // This will likely fail due to browser security unless opened via a specific script.
            try {
                window.close();
            } catch (e) {
                console.log("Browser prevented window.close()");
            }

            // Immediately trigger the fallback cinematic curtain drop just in case
            const curtain = document.getElementById('final-curtain');
            curtain.style.pointerEvents = 'all';
            curtain.style.opacity = '1';

            // Smoothly fade out the music over 2 seconds
            if(isPlaying) {
                let vol = music.volume;
                const fadeOut = setInterval(() => {
                    if (vol > 0.05) {
                        vol -= 0.05;
                        music.volume = vol;
                    } else {
                        clearInterval(fadeOut);
                        music.pause();
                        music.volume = 1; // reset for future
                    }
                }, 100);
            }
        }

        // 7. Floating Particles (Canvas)
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray = [];
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            for (let i = 0; i < 80; i++) particlesArray.push(new Particle());
        }
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    </script>
</body>
</html>