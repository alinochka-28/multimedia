// Создание аудиоконтекста и анализатора для визуализации
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = new Audio('music/muz1.mp3'); // Укажите свой аудиотрек здесь
const source = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Настройки визуализации аудио
const balls = document.querySelectorAll('.ball'); // Получаем все шарики
const frequencyData = new Uint8Array(analyser.frequencyBinCount); // Массив для частотных данных
let currentBallIndex = 0; // Индекс текущего шарика

function animateBalls() {
    requestAnimationFrame(animateBalls);

    analyser.getByteFrequencyData(frequencyData); // Получаем данные частот

    balls.forEach((ball, i) => {
        const scaleFactor = (frequencyData[i] / 255) * 1.5; // Нормируем данные для масштабирования
        const jumpHeight = (frequencyData[i] / 255) * 30; // Максимальная высота прыжка (в пикселях)

        // Увеличиваем шарик и меняем его положение
        ball.style.transform = `translateY(${-jumpHeight}px) scale(${scaleFactor})`; // Двигаем шарик вверх и изменяем его размер
    });
}

// Вызов функции визуализации при воспроизведении аудио
audioElement.onplay = () => {
    audioCtx.resume();
    animateBalls(); // Запуск анимации шариков
};

// Логика переключения изображений
const images = [
    { src: 'img/image1.png', comment: '' },
    { src: 'img/image2.png', comment: '' },
    { src: 'img/image3.png', comment: '' }
];
let currentIndex = 0;
let intervalId;

document.addEventListener('DOMContentLoaded', () => {
    updateImage();
    setAutoSwitch();
});

// Обновление изображения
function updateImage() {
    const imageElement = document.getElementById('current-image');
    imageElement.style.opacity = 0; // Уменьшаем непрозрачность

    setTimeout(() => {
        imageElement.src = images[currentIndex].src; // Меняем изображение
        imageElement.onload = () => {
            imageElement.style.opacity = 1; // Восстанавливаем непрозрачность после загрузки
        };
    }, 500); // Задержка перед обновлением изображения
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
}

function setAutoSwitch() {
    clearInterval(intervalId);
    intervalId = setInterval(nextImage, 5000); // Установка времени для автоматического переключения
}

// Логика управления аудиоплеером
let isPlaying = false;

function togglePlayPause() {
    if (isPlaying) {
        audioElement.pause();
        document.getElementById('play-pause-icon').src = 'icons/play.png';
    } else {
        audioElement.play();
        document.getElementById('play-pause-icon').src = 'icons/pause.png';
    }
    isPlaying = !isPlaying;
}

audioElement.addEventListener('timeupdate', () => {
    const progressBar = document.getElementById('progress-bar');

    if (!progressBar.dragging) {
        progressBar.value = (audioElement.currentTime / audioElement.duration) * 100;
    }
});

const progressBar = document.getElementById('progress-bar');
progressBar.addEventListener('mousedown', () => {
    progressBar.dragging = true;
});

progressBar.addEventListener('mouseup', () => {
    progressBar.dragging = false;
    changeAudioPosition();
});

progressBar.addEventListener('input', () => {
    if (progressBar.dragging) {
        audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
    }
});

function changeAudioPosition() {
    audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
}

const audioFiles = ['music/muz1.mp3', 'music/muz2.mp3', 'music/muz3.mp3'];
let currentTrackIndex = 0;

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % audioFiles.length;
    changeTrack(currentTrackIndex);
}

function previousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + audioFiles.length) % audioFiles.length;
}

function changeTrack(trackNumber) {
    audioElement.src = audioFiles[trackNumber];
    audioElement.play();
    document.getElementById('play-pause-icon').src = 'icons/pause.png';
    isPlaying = true;

    audioElement.addEventListener('loadedmetadata', () => {
        progressBar.value = 0;
    }, { once: true });
}

// Автоматическое воспроизведение первого трека при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    audioElement.play();
});
