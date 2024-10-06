// Создание аудиоконтекста и анализатора для визуализации
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = new Audio('music/muz1.mp3'); // Укажите свой аудиотрек здесь
const source = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Настройки визуализации аудио
const balls = document.querySelectorAll('.ball'); // Получаем все шарики

function animateBalls() {
    requestAnimationFrame(animateBalls);

    const bufferLength = analyser.frequencyBinCount; // Используем количество частот
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray); // Получаем данные частот

    // Перебираем каждый шарик и изменяем его положение
    balls.forEach((ball, index) => {
        // Устанавливаем максимальное значение высоты, на которое будет прыгать шарик
        const maxJumpHeight = 90; // Пик (в пикселях) прыжка

        // Получаем значение амплитуды для текущего шарика
        const amplitude = dataArray[index] || 0; // Защита от NaN
        const jumpHeight = (amplitude / 255) * maxJumpHeight; // Нормализуем значение

        // Применяем стиль для перемещения шарика
        ball.style.transform = `translateY(-${jumpHeight}px)`; // Поднимаем шарик
    });
}

// Вызов функции визуализации при воспроизведении аудио
audioElement.onplay = () => {
    audioCtx.resume();
    animateBalls(); // Запуск анимации шариков
};

// Логика переключения изображений
const images = [
    { src: 'img/image1.png', comment: 'heat waves' },
    { src: 'img/image2.png', comment: 'best friend' },
    { src: 'img/image3.png', comment: 'mine' }
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
    const commentElement = document.getElementById('comment');
    imageElement.style.opacity = 0; // Уменьшаем непрозрачность

    setTimeout(() => {
        imageElement.src = images[currentIndex].src; // Меняем изображение
        commentElement.textContent = images[currentIndex].comment; // Обновляем комментарий
        imageElement.onload = () => {
            imageElement.style.opacity = 1; // Восстанавливаем непрозрачность после загрузки
        };
    }, 500); // Задержка перед обновлением изображения
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length; // Увеличиваем индекс и используем модуль для перехода к началу
    updateImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length; // Уменьшаем индекс и используем модуль для перехода к концу
    updateImage(); // Обновляем изображение
}

function setAutoSwitch() {
    clearInterval(intervalId);
    intervalId = setInterval(nextImage, 5000); // Установка времени для автоматического переключения
}

function setAutoSwitch() {
    clearInterval(intervalId);
    intervalId = setInterval(nextImage, intervalTime); // Используем переменную intervalTime для автоматического переключения
}

// Добавляем слушатель событий для кнопки установки времени переключения
document.getElementById('set-timing').addEventListener('click', () => {
    const timingInput = document.getElementById('timing-input').value;
    intervalTime = timingInput * 1000; // Преобразуем секунды в миллисекунды
    setAutoSwitch(); // Перезапускаем переключение с новым временем
});

// Добавляем обработчик событий для кнопки "Отменить"
document.getElementById('cancel-switch').addEventListener('click', () => {
    clearInterval(intervalId); // Останавливаем автопереключение
});

// Остальной код остается без изменений


// Инициализация автоматического переключения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateImage();
    setAutoSwitch(); // Запуск с временем по умолчанию
});

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
