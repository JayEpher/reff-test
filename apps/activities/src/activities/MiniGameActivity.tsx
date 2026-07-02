import React, { useState } from 'react';
import { useWebViewActivity, postMessageToRN } from '@/shared';
import './MiniGameActivity.css';

export const MiniGameActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const handleStartGame = () => {
    setGameStarted(true);
    postMessageToRN({
      type: 'GAME_STARTED',
      payload: { gameName: 'mini-game' },
    });
  };

  const handleGameOver = () => {
    postMessageToRN({
      type: 'GAME_OVER',
      payload: { score },
    });
    setGameStarted(false);
  };

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="mini-game-container">
      <h1>🎮 迷你游戏</h1>

      {!gameStarted ? (
        <div className="game-start">
          <p>准备好开始游戏了吗？</p>
          <button onClick={handleStartGame} className="start-button">
            开始游戏
          </button>
        </div>
      ) : (
        <div className="game-play">
          <div className="score">得分: {score}</div>
          <button onClick={() => setScore(score + 1)} className="play-button">
            点击得分
          </button>
          <button onClick={handleGameOver} className="end-button">
            结束游戏
          </button>
        </div>
      )}
    </div>
  );
};
