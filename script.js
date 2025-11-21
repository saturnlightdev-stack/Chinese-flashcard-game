// --- DOM Elements ---
const mainUI = document.getElementById('main-ui');
const flashcardUI = document.getElementById('flashcard-ui');
const quizUI = document.getElementById('quiz-ui');
const resultUI = document.getElementById('result-ui');
const lessonCardsContainer = document.getElementById('lesson-cards');

// Flashcard UI Elements
const flashcardContainer = document.getElementById('flashcard-container');
const vocabHanzi = document.querySelector('#flashcard-ui .vocab-hanzi');
const vocabPinyin = document.querySelector('#flashcard-ui .vocab-pinyin');
const vocabThai = document.querySelector('#flashcard-ui .vocab-thai');
const lessonTitleDisplay = document.querySelectorAll('.lesson-title');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const testReadyBtn = document.getElementById('test-ready-btn');
const backToMainBtn = document.getElementById('back-to-main-btn');

// 💡 เพิ่ม 3 ตัวแปรใหม่สำหรับ รูปภาพและเสียง
const vocabImage = document.getElementById('vocab-image'); 
const audioBtn = document.getElementById('audio-btn');     
const vocabAudio = document.getElementById('vocab-audio');

// Quiz UI Elements
const quizHanzi = document.querySelector('#quiz-ui .quiz-hanzi');
const quizPinyin = document.querySelector('#quiz-ui .quiz-pinyin');
const quizOptionsContainer = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const quizBackToMainBtn = document.getElementById('quiz-back-to-main-btn');

// Result UI Elements
const scoreDisplay = document.getElementById('score-display');
const reviewBtn = document.getElementById('review-btn');
const resultBackToMainBtn = document.getElementById('result-back-to-main-btn');

// --- State Variables ---
let allLessons = [];
let currentLessonVocab = [];
let currentVocabIndex = 0;
let currentLessonId = null;

// Quiz state
let currentQuizVocab = [];
let currentQuizIndex = 0;
let score = 0;

// --- Utility Functions ---

/**
 * สลับการแสดงผล UI
 * @param {HTMLElement} showUI - UI ที่ต้องการแสดง
 */
function switchUI(showUI) {
    [mainUI, flashcardUI, quizUI, resultUI].forEach(ui => {
        ui.classList.add('d-none');
    });
    showUI.classList.remove('d-none');
}

/**
 * โหลดข้อมูลจาก JSON
 */
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allLessons = data.lessons;
        renderLessonCards();
    } catch (error) {
        console.error('Error loading JSON data:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลคำศัพท์');
    }
}

// --- Main UI Logic ---

/**
 * สร้างการ์ดบทเรียนบนหน้า Main UI
 */
function renderLessonCards() {
    lessonCardsContainer.innerHTML = ''; // เคลียร์การ์ดเก่า
    allLessons.forEach(lesson => {
        const cardHTML = `
            <div class="col">
                <div class="card lesson-card h-100" data-lesson-id="${lesson.id}">
                    <img src="${lesson.image}" class="lesson-card-img" alt="${lesson.title}" onerror="this.onerror=null;this.src='';">
                    <div class="card-body d-flex flex-column justify-content-end">
                        <h5 class="card-title">${lesson.title}</h5>
                    </div>
                </div>
            </div>
        `;
        lessonCardsContainer.innerHTML += cardHTML;
    });

    // เพิ่ม Event Listener ให้กับการ์ดทั้งหมด
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', () => {
            const lessonId = parseInt(card.getAttribute('data-lesson-id'));
            startLesson(lessonId);
        });
    });
}

// --- Flashcard UI Logic ---

/**
 * เริ่มบทเรียนที่เลือก
 * @param {number} lessonId - ID ของบทเรียน
 */
function startLesson(lessonId) {
    currentLessonId = lessonId;
    const lesson = allLessons.find(l => l.id === lessonId);
    if (!lesson) return;

    currentLessonVocab = lesson.vocab;
    currentVocabIndex = 0;
    
    // ตั้งค่าชื่อบทเรียน
    lessonTitleDisplay.forEach(el => el.textContent = lesson.title);
    
    updateFlashcard();
    switchUI(flashcardUI);
}
/**
 * ลบสัญลักษณ์วรรณยุกต์และตัวอักษรพิเศษออกจาก Pinyin 
 * @param {string} pinyin - Pinyin ที่มีวรรณยุกต์ (เช่น Nǐ hǎo)
 * @returns {string} - Pinyin ที่ไม่มีวรรณยุกต์ (เช่น ni hao)
 */
function cleanPinyinForFile(pinyin) {
    if (!pinyin) return '';
    return pinyin
        .normalize('NFD') // แยกสัญลักษณ์วรรณยุกต์ออกจากตัวอักษร
        .replace(/[\u0300-\u036f]/g, "") // ลบสัญลักษณ์วรรณยุกต์ที่แยกออกมา
        .toLowerCase();
}

/**
 * อัพเดทเนื้อหาบน Flashcard
 */
function updateFlashcard() {
    if (currentVocabIndex < 0 || currentVocabIndex >= currentLessonVocab.length) return;

    const vocab = currentLessonVocab[currentVocabIndex];
    vocabHanzi.textContent = vocab.hanzi;
    vocabPinyin.textContent = vocab.pinyin;
    vocabThai.textContent = vocab.thai;
    
    // 💡 1. โค้ดสำหรับรูปภาพ
    if (vocab.image) {
        vocabImage.src = vocab.image; 
        vocabImage.classList.remove('d-none'); // แสดงรูปภาพ
    } else {
        vocabImage.src = '';
        vocabImage.classList.add('d-none'); // ซ่อนถ้าไม่มีรูปใน JSON
    }

    // 💡 2. โค้ดสำหรับเสียง
    // แปลง Pinyin ให้เป็นรูปแบบชื่อไฟล์ (เช่น Nǐ hǎo -> ni-hao)
    const rawPinyin = vocab.pinyinWithoutTone || vocab.pinyin; // ใช้ field ใหม่ (ถ้ามี) หรือ field เดิม
    const pinyinForFilename = rawPinyin.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]/g, '');

    vocabAudio.src = `audio/${pinyinForFilename}.ogg`; // ใช้โฟลเดอร์ audio/
    
    // รีเซ็ตการพลิก
    flashcardContainer.classList.remove('flipped');
    
    // จัดการปุ่ม
    prevBtn.disabled = currentVocabIndex === 0;
    
    if (currentVocabIndex === currentLessonVocab.length - 1) {
        nextBtn.classList.add('d-none');
        testReadyBtn.classList.remove('d-none');
    } else {
        nextBtn.classList.remove('d-none');
        testReadyBtn.classList.add('d-none');
    }
}

// Event Listeners for Flashcard UI
// Event Listeners for Flashcard UI
flashcardContainer.addEventListener('click', () => {
    flashcardContainer.classList.toggle('flipped');
});

// 💡 เพิ่ม Event Listener สำหรับปุ่มเสียง
audioBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // สำคัญ: หยุดการพลิกการ์ดเมื่อกดปุ่มเสียง
    vocabAudio.currentTime = 0; // ตั้งค่าเวลาเล่นกลับไปเริ่มต้น
    vocabAudio.play().catch(error => {
        console.error("Error playing audio:", error);
    });
});

nextBtn.addEventListener('click', () => {
    if (currentVocabIndex < currentLessonVocab.length - 1) {
        currentVocabIndex++;
        updateFlashcard();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentVocabIndex > 0) {
        currentVocabIndex--;
        updateFlashcard();
    }
});

backToMainBtn.addEventListener('click', () => {
    switchUI(mainUI);
});

testReadyBtn.addEventListener('click', () => {
    startQuiz();
});

// --- Quiz UI Logic ---

/**
 * เริ่มแบบทดสอบ
 */
function startQuiz() {
    score = 0;
    currentQuizIndex = 0;
    // สุ่มลำดับคำศัพท์
    currentQuizVocab = [...currentLessonVocab].sort(() => Math.random() - 0.5); 
    
    quizBackToMainBtn.classList.add('d-none');
    
    loadQuizQuestion();
    switchUI(quizUI);
}

/**
 * โหลดคำถามแบบทดสอบถัดไป
 */
function loadQuizQuestion() {
    if (currentQuizIndex >= currentQuizVocab.length) {
        showResult();
        return;
    }

    const currentVocab = currentQuizVocab[currentQuizIndex];
    
    // Reset
    quizOptionsContainer.innerHTML = '';
    quizFeedback.textContent = '';

    quizHanzi.textContent = currentVocab.hanzi;
    quizPinyin.textContent = currentVocab.pinyin;

    // สร้างตัวเลือก (4 ตัวเลือก)
    const allThaiTranslations = currentLessonVocab.map(v => v.thai);
    const correctTranslation = currentVocab.thai;
    
    // หาตัวเลือกที่ผิด 3 ตัวที่ไม่ซ้ำกัน
    let incorrectOptions = [];
    while (incorrectOptions.length < 3) {
        const randomIndex = Math.floor(Math.random() * allThaiTranslations.length);
        const randomTranslation = allThaiTranslations[randomIndex];
        if (randomTranslation !== correctTranslation && !incorrectOptions.includes(randomTranslation)) {
        incorrectOptions.push(randomTranslation);
        }
    }

    const options = [...incorrectOptions, correctTranslation];
    // สุ่มตำแหน่งตัวเลือก
    options.sort(() => Math.random() - 0.5); 

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-outline-dark', 'quiz-option-btn');
        btn.textContent = option;
        btn.addEventListener('click', () => handleAnswer(option, correctTranslation));
        quizOptionsContainer.appendChild(btn);
    });
}

/**
 * จัดการเมื่อผู้ใช้เลือกคำตอบ
 * @param {string} selectedAnswer - คำตอบที่ผู้ใช้เลือก
 * @param {string} correctAnswer - คำตอบที่ถูกต้อง
 */
function handleAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    const allOptionButtons = quizOptionsContainer.querySelectorAll('button');
    
    // Disable ทุกปุ่ม
    allOptionButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        score++;
        quizFeedback.textContent = '✅ ถูกต้อง เก่งมากจ้าาา';
        quizFeedback.classList.remove('incorrect');
        quizFeedback.classList.add('correct');
    } else {
        quizFeedback.textContent = `❌ อาจจะยังน้าาา อันนี้แปลว่า ${correctAnswer}`;
        quizFeedback.classList.remove('correct');
        quizFeedback.classList.add('incorrect');
    }
    
    // เน้นปุ่มที่ถูกต้อง/ผิด
    allOptionButtons.forEach(btn => {
        if (btn.textContent === correctAnswer) {
            btn.classList.remove('btn-outline-dark');
            btn.classList.add('btn-success');
        } else if (btn.textContent === selectedAnswer && !isCorrect) {
            btn.classList.remove('btn-outline-dark');
            btn.classList.add('btn-danger');
        }
    });

    // สร้างปุ่ม "คำถามถัดไป" หรือ "ดูผลลัพธ์"
    const nextQuizBtn = document.createElement('button');
    nextQuizBtn.classList.add('btn', 'btn-info', 'mt-3');
    nextQuizBtn.textContent = currentQuizIndex < currentQuizVocab.length - 1 ? 'คำถามถัดไป' : 'ดูผลลัพธ์';
    nextQuizBtn.addEventListener('click', () => {
        currentQuizIndex++;
        loadQuizQuestion();
    });
    
    // เพิ่มปุ่มกลับหน้าแรกตอนท้ายแบบทดสอบ
    if (currentQuizIndex === currentQuizVocab.length - 1) {
        quizBackToMainBtn.classList.remove('d-none');
    }

    quizOptionsContainer.appendChild(nextQuizBtn);
}

// Event Listener for Quiz UI
quizBackToMainBtn.addEventListener('click', () => {
    switchUI(mainUI);
});

// --- Result UI Logic ---

/**
 * แสดงหน้าสรุปผล
 */
function showResult() {
    scoreDisplay.textContent = `${score}/${currentQuizVocab.length}`;
    switchUI(resultUI);
}

// Event Listeners for Result UI
reviewBtn.addEventListener('click', () => {
    // กลับไปเรียนซ้ำ
    startLesson(currentLessonId); 
});

resultBackToMainBtn.addEventListener('click', () => {
    switchUI(mainUI);
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', loadData);