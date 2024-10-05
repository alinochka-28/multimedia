// Создание аудиоконтекста и анализатора для визуализации
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const audioElement = new Audio('music/muz1.mp3');
const source = audioCtx.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Настройки визуализации аудио
const canvas = document.createElement('canvas');
document.querySelector('.audio-controls').appendChild(canvas);
const canvasCtx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 90;

function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    const bufferLength = analyser.fftSize; // Используем FFT размер
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray); // Получаем данные по времени

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Прозрачный фон
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height); // Очищаем холст

    canvasCtx.lineWidth = 2; // Толщина линии
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)'; // Цвет линии

    canvasCtx.beginPath();

    const sliceWidth = canvas.width / bufferLength; // Ширина каждого среза
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 0.5 + 0.5; // Преобразуем данные в диапазон [0, 1]
        const y = v * canvas.height; // Масштабируем по высоте

        if (i === 0) {
            canvasCtx.moveTo(x, y); // Начальная точка
        } else {
            canvasCtx.lineTo(x, y); // Соединяем линии
        }

        x += sliceWidth; // Переход к следующему срезу
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2); // Завершаем линию
    canvasCtx.stroke(); // Рисуем линию
}

// Вызов функции визуализации при воспроизведении аудио
audioElement.onplay = () => {
    audioCtx.resume();
    drawWaveform(); // Запуск визуализации волны
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
    updateImage();
}

function setAutoSwitch() {
    clearInterval(intervalId);
    const timing = document.getElementById('timing') ? document.getElementById('timing').value * 1000 : 5000;
    intervalId = setInterval(nextImage, timing);
}

// Логика управления аудиоплеером
let currentTrackIndex = 0;
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

function changeTrack(trackNumber) {
    const audioFiles = ['music/muz1.mp3', 'music/muz2.mp3', 'music/muz3.mp3'];
    const trackNames = ['sometimes all i think about is you', 'best friend', 'mine'];

    console.log("Changing track to: ", audioFiles[trackNumber]);

    currentTrackIndex = (trackNumber + audioFiles.length - 1) % audioFiles.length;

    const progressBar = document.getElementById('progress-bar');
    progressBar.classList.add('hidden');

    audioElement.src = audioFiles[currentTrackIndex];
    document.getElementById('audio-filename').textContent = trackNames[currentTrackIndex];

    audioElement.addEventListener('loadedmetadata', () => {
        console.log('Audio loaded:', audioElement.src);
        progressBar.value = 0;
        progressBar.classList.remove('hidden');

        audioElement.play().then(() => {
            console.log("Playing audio: ", audioElement.src);
        }).catch(error => {
            console.error("Error playing audio: ", error);
        });

        document.getElementById('play-pause-icon').src = 'icons/pause.png';
        isPlaying = true;
    }, { once: true });
}


function nextTrack() {
    changeTrack(currentTrackIndex + 2);
}

function previousTrack() {
    changeTrack(currentTrackIndex);
}

function uploadAudio(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('audio-filename').textContent = file.name;

        audioElement.src = URL.createObjectURL(file);
        audioElement.play();
        console.log(audioElement.src)
        document.getElementById('play-pause-icon').src = 'icons/pause.png';
        isPlaying = true;
    }
}

audioElement.addEventListener('ended', nextTrack);

// Включение аудиоконтекста и запуска визуализатора при воспроизведении
audioElement.onplay = () => {
    audioCtx.resume();
    drawVisualizer();
};
