function celebrateSuccess() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = ['🎉', '✨', '🔥', '💪', '⭐', '🏆'][Math.floor(Math.random() * 6)];
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: -50px;
        font-size: ${randomInRange(1, 3)}rem;
        z-index: 9999;
        pointer-events: none;
        animation: fall ${randomInRange(2, 4)}s linear forwards;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }, 250);
}

const style = document.createElement('style');
style.textContent = `@keyframes fall { to { top: 100vh; transform: rotate(360deg); opacity: 0; }}`;
document.head.appendChild(style);

let timerInterval, timeRemaining = 120, cardsCompleted = 0;

function startTimedChallenge() {
  timeRemaining = 120;
  cardsCompleted = 0;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) endTimedChallenge();
    else if (timeRemaining <= 10) document.querySelector('.timer-display')?.classList.add('warning');
  }, 1000);
  
  document.getElementById('startBtn')?.classList.add('d-none');
  document.getElementById('challengeArea')?.classList.remove('d-none');
  shuffleTimedCard();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timerEl = document.querySelector('.timer-display');
  if (timerEl) timerEl.textContent = display;
  const scoreEl = document.getElementById('currentScore');
  if (scoreEl) scoreEl.textContent = cardsCompleted;
}

function shuffleTimedCard() {
  fetch('/workouts/random')
    .then(res => res.json())
    .then(workout => {
      document.getElementById('timedCardName').textContent = workout.name;
      document.getElementById('timedCardDesc').textContent = workout.description;
    })
    .catch(err => {
      console.error('Error fetching workout:', err);
      document.getElementById('timedCardName').textContent = 'Error loading workout';
      document.getElementById('timedCardDesc').textContent = 'Please refresh and try again';
    });
}

function completeTimedCard() {
  cardsCompleted++;
  updateTimerDisplay();
  celebrateSuccess();
  shuffleTimedCard();
}

function endTimedChallenge() {
  clearInterval(timerInterval);
  fetch('/challenges/timed/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: cardsCompleted })
  });
  celebrateSuccess();
  setTimeout(() => {
    alert(`🎉 Time's up! You completed ${cardsCompleted} cards!`);
    location.reload();
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

setTimeout(() => {
  document.querySelectorAll('.alert').forEach(alert => {
    alert.style.transition = 'opacity 0.5s, transform 0.5s';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-20px)';
    setTimeout(() => alert.remove(), 500);
  });
}, 5000);