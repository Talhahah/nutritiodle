import { FormEvent, useMemo, useRef, useState } from 'react';
import { getFoodsForToday, getAllDates, type Food, type NutrientKey } from '@/foods';

type Guesses = Record<NutrientKey, string>;

const emptyGuesses = (): Guesses => ({ fat: '', sugars: '', protein: '' });

type AccuracyTier = 'exact' | 'great' | 'good' | 'close' | 'off';

function getAccuracyTier(guess: number, actual: number): AccuracyTier {
  if (actual === 0) return guess === 0 ? 'exact' : guess <= 2 ? 'great' : 'off';
  const percent = Math.abs(guess - actual) / actual;
  if (percent === 0) return 'exact';
  if (percent <= 0.1) return 'great';
  if (percent <= 0.25) return 'good';
  if (percent <= 0.5) return 'close';
  return 'off';
}

const tierColors: Record<AccuracyTier, { text: string; bg: string; border: string; label: string }> = {
  exact: { text: '#15803d', bg: '#dcfce7', border: '#16a34a', label: 'Perfect' },
  great: { text: '#166534', bg: '#e8f5e9', border: '#22c55e', label: 'Great' },
  good: { text: '#854d0e', bg: '#fef9c3', border: '#eab308', label: 'Close' },
  close: { text: '#9a3412', bg: '#fed7aa', border: '#f97316', label: 'A bit off' },
  off: { text: '#991b1b', bg: '#fee2e2', border: '#ef4444', label: 'Way off' },
};

function App() {
  const allDates = useMemo(() => getAllDates(), []);
  const today = new Date().toISOString().slice(0, 10);
  const fallbackFoods = useMemo(() => getFoodsForToday(), []);

  const [foods] = useState<Food[]>(fallbackFoods);
  const [foodIndex, setFoodIndex] = useState(0);
  const [guesses, setGuesses] = useState<Guesses>(emptyGuesses);
  const [checked, setChecked] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (sound: 'input' | 'submit' | 'next' | 'finish') => {
    const AudioContextClass = window.AudioContext;
    const audioContext = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = audioContext;
    void audioContext.resume();

    const sequences: Record<typeof sound, { frequency: number; duration: number; delay: number }[]> = {
      input: [{ frequency: 720, duration: 0.025, delay: 0 }],
      submit: [
        { frequency: 440, duration: 0.12, delay: 0 },
        { frequency: 660, duration: 0.16, delay: 0.08 },
        { frequency: 880, duration: 0.2, delay: 0.18 },
      ],
      next: [
        { frequency: 520, duration: 0.1, delay: 0 },
        { frequency: 740, duration: 0.14, delay: 0.08 },
      ],
      finish: [
        { frequency: 523, duration: 0.14, delay: 0 },
        { frequency: 659, duration: 0.14, delay: 0.1 },
        { frequency: 784, duration: 0.14, delay: 0.2 },
        { frequency: 1047, duration: 0.28, delay: 0.3 },
      ],
    };

    sequences[sound].forEach(({ frequency, duration, delay }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startTime = audioContext.currentTime + delay;
      oscillator.type = sound === 'input' ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(sound === 'input' ? 0.018 : 0.055, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  };

  if (foods.length === 0) {
    return (
      <main className="game-shell">
        <div className="game-column">
          <header className="title-card"><span className="brand-mark">✳</span> NUTRITIODLE <span className="brand-mark">✳</span><small>THE DAILY NUTRITION GUESSING GAME</small></header>
          <div className="no-game-card">
            <h2>No game for today</h2>
            <p>There's no daily game set for {today}.</p>
            <p className="muted">Available dates: {allDates.join(', ') || 'none yet'}</p>
            <p className="muted">Add a row to <code>public/daily-foods.csv</code> with today's date to start a game.</p>
          </div>
        </div>
      </main>
    );
  }

  const food = foods[foodIndex];
  const allGuessesFilled = food.nutrients.every(({ key }) => guesses[key] !== '');
  const averageGuess = food.nutrients.reduce((total, { key }) => total + Number(guesses[key] || 0), 0) / food.nutrients.length;
  const averageActual = food.nutrients.reduce((total, { value }) => total + value, 0) / food.nutrients.length;
  const averageOff = Math.abs(averageGuess - averageActual);
  const score = Math.max(0, Math.round(100 - (averageOff / averageActual) * 100));
  const completedScores = finished ? scores : [...scores, ...(checked ? [score] : [])];
  const totalScore = completedScores.reduce((total, current) => total + current, 0);
  const finalAverage = Math.round(totalScore / foods.length);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!allGuessesFilled || checked) return;
    setChecked(true);
    playSound('submit');
  };

  const handleGuessChange = (key: NutrientKey, value: string) => {
    setGuesses((current) => ({ ...current, [key]: value.replace(/[^0-9]/g, '') }));
    setChecked(false);
    if (value !== '') playSound('input');
  };

  const handleNext = () => {
    const nextScores = [...scores, score];
    setScores(nextScores);
    playSound(foodIndex === foods.length - 1 ? 'finish' : 'next');

    if (foodIndex === foods.length - 1) {
      setFinished(true);
      return;
    }

    setFoodIndex((current) => current + 1);
    setGuesses(emptyGuesses());
    setChecked(false);
  };

  const resetGame = () => {
    setFoodIndex(0);
    setGuesses(emptyGuesses());
    setChecked(false);
    setScores([]);
    setFinished(false);
  };

  const resolvePhoto = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    return `/food-photos/${photo}`;
  };

  return (
    <main className="game-shell">
      <div className="game-column">
        <header className="title-card"><span className="brand-mark">✳</span> NUTRITIODLE <span className="brand-mark">✳</span><small>THE DAILY NUTRITION GUESSING GAME</small></header>

        <section className="product-frame" aria-label="Featured product"><div className="panel-label"><span>✦ TODAY’S FOOD</span><span>#{String(foodIndex + 1).padStart(2, "0")}</span></div>
          {food.photo ? (
            <div className="product-photo">
              <img src={resolvePhoto(food.photo)} alt={food.name} />
            </div>
          ) : (
            <div className="product-art">
              <div className="package-top">{food.brand}</div>
              <div className="package-main">
                <span className="package-kicker">Daily food {foodIndex + 1}</span>
                <strong>{food.name}</strong>
                <span className="package-detail">{food.detail}</span>
              </div>
              <div className="cake-shape"><span /></div>
              <div className="package-side">NEW!</div>
            </div>
          )}
        </section>

        <form className="nutrition-card" onSubmit={handleSubmit}>
          <div className="nutrition-inner">
            <div className="round-indicator">{finished ? 'ROUND COMPLETE' : `${foodIndex + 1} OF ${foods.length}`}</div>
            <h1>Nutrition Facts</h1>
            <div className="rule rule-thin" />
            <p className="servings">{food.servings}</p>
            <div className="serving-size">
              <strong>Serving Size</strong>
              <strong>{food.servingSize}</strong>
            </div>
            <div className="rule rule-thick" />
            <div className="calories-caption">Amount per serving</div>
            <div className="calories-row"><strong>Calories</strong><strong>{food.calories}</strong></div>
            <div className="rule rule-thick" />

            {food.nutrients.map(({ key, label, value }) => {
              const guess = Number(guesses[key]);
              const difference = Math.abs(guess - value);
              const tier = getAccuracyTier(guess, value);
              const colors = tierColors[tier];
              return (
                <div className="nutrient-row" key={key}>
                  <strong>{label}</strong>
                  <div className="nutrient-answer">
                    <input
                      aria-label={`Guess ${label}`}
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="?"
                      value={guesses[key]}
                      disabled={checked}
                      onChange={(event) => handleGuessChange(key, event.target.value)}
                    />
                    {checked && (
                      <span
                        className="revealed-value"
                        style={{ color: colors.text, fontWeight: 900 }}
                      >
                        / {value}g
                      </span>
                    )}
                  </div>
                  {checked && (
                    <span
                      className="difference tier-badge"
                      style={{ color: colors.text }}
                    >
                      {tier === 'exact' ? 'exact' : `${difference}g off`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {!finished && (
            <button
              className="check-button"
              type={checked ? 'button' : 'submit'}
              onClick={checked ? handleNext : undefined}
              disabled={!allGuessesFilled}
            >
              {checked ? (foodIndex === foods.length - 1 ? 'See final score' : 'Next food') : allGuessesFilled ? 'Check guesses' : 'Fill all three guesses'}
            </button>
          )}
          {checked && !finished && (
            <div className="score-card">
              <div className="score-heading">This food <strong>{score}/100</strong></div>
              <div className="score-details">Average guess: {averageGuess.toFixed(1)}g · Average off: {averageOff.toFixed(1)}g</div>
            </div>
          )}
          {finished && (
            <div className="score-card final-score-card">
              <div className="score-heading">Final score <strong>{finalAverage}/100</strong></div>
              <div className="score-details">Average of your {foods.length} food scores</div>
              <button type="button" onClick={resetGame}>Play again</button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default App;
