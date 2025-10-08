import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, User, Cpu, RotateCcw, Target, Swords, Plus, Upload, X, Lock } from 'lucide-react';

const VirtualPogGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [playerPogs, setPlayerPogs] = useState([]);
  const [computerPogs, setComputerPogs] = useState([]);
  const [stackedPogs, setStackedPogs] = useState([]);
  const [selectedPogDesigns, setSelectedPogDesigns] = useState([]);
  const [hoveredPog, setHoveredPog] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [aimAngle, setAimAngle] = useState(50);
  const [power, setPower] = useState(70);
  const [isThrowning, setIsThrowning] = useState(false);
  const [slammerPos, setSlammerPos] = useState({ x: 50, y: 20, z: 0, rotation: 0 });
  const [flippingPogs, setFlippingPogs] = useState([]);
  const [particles, setParticles] = useState([]);
  const [screenShake, setScreenShake] = useState(0);
  const [message, setMessage] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [confetti, setConfetti] = useState([]);
  const [showAimGuide, setShowAimGuide] = useState(true);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [showCustomPogModal, setShowCustomPogModal] = useState(false);
  const [customPogs, setCustomPogs] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [pogName, setPogName] = useState('');
  const [showFlipShowcase, setShowFlipShowcase] = useState(false);
  const [showcaseEffect, setShowcaseEffect] = useState(null);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  const MAX_FREE_CUSTOM_POGS = 5;
  const POGS_PER_GAME = 15;

  useEffect(() => {
    const saved = localStorage.getItem('customPogs');
    if (saved) {
      setCustomPogs(JSON.parse(saved));
    }
  }, []);

  const saveCustomPogsToStorage = (pogs) => {
    localStorage.setItem('customPogs', JSON.stringify(pogs));
  };

  const defaultPogDesigns = [
    { bg: '#FF1744', secondary: '#D50000', icon: '💀', name: 'SKULL CRUSHER', foil: true, rarity: 'legendary', isDefault: true },
    { bg: '#00E5FF', secondary: '#00B8D4', icon: '⭐', name: 'COSMIC STAR', foil: true, rarity: 'rare', isDefault: true },
    { bg: '#FF6E40', secondary: '#FF3D00', icon: '🔥', name: 'INFERNO', foil: false, rarity: 'common', isDefault: true },
    { bg: '#FFEA00', secondary: '#FFD600', icon: '⚡', name: 'THUNDER BOLT', foil: true, rarity: 'legendary', isDefault: true },
    { bg: '#7C4DFF', secondary: '#651FFF', icon: '🐉', name: 'DRAGON FURY', foil: true, rarity: 'legendary', isDefault: true },
    { bg: '#FF9100', secondary: '#FF6D00', icon: '🐯', name: 'TIGER STRIKE', foil: false, rarity: 'rare', isDefault: true },
    { bg: '#00E676', secondary: '#00C853', icon: '👽', name: 'ALIEN INVADER', foil: true, rarity: 'rare', isDefault: true },
    { bg: '#FF4081', secondary: '#F50057', icon: '❤️', name: 'HEART BREAKER', foil: false, rarity: 'common', isDefault: true },
    { bg: '#00BFA5', secondary: '#00897B', icon: '💎', name: 'DIAMOND KING', foil: true, rarity: 'legendary', isDefault: true },
    { bg: '#FFAB00', secondary: '#FF8F00', icon: '👑', name: 'ROYAL CROWN', foil: true, rarity: 'legendary', isDefault: true },
    { bg: '#536DFE', secondary: '#3D5AFE', icon: '🚀', name: 'ROCKET POWER', foil: false, rarity: 'rare', isDefault: true },
    { bg: '#69F0AE', secondary: '#00E676', icon: '☮️', name: 'PEACE KEEPER', foil: true, rarity: 'rare', isDefault: true },
  ];

  const allPogDesigns = [...defaultPogDesigns, ...customPogs];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCustomPog = () => {
    if (!uploadedImage || !pogName.trim()) {
      alert('Please upload an image and enter a name!');
      return;
    }

    if (customPogs.length >= MAX_FREE_CUSTOM_POGS) {
      alert('You\'ve reached the free limit! Unlock more slots to continue.');
      return;
    }

    const newPog = {
      id: `custom-${Date.now()}`,
      name: pogName.trim().toUpperCase(),
      image: uploadedImage,
      bg: '#667eea',
      secondary: '#764ba2',
      foil: true,
      rarity: 'custom',
      isCustom: true
    };

    const updated = [...customPogs, newPog];
    setCustomPogs(updated);
    saveCustomPogsToStorage(updated);
    
    setUploadedImage(null);
    setPogName('');
    setShowCustomPogModal(false);
  };

  const deleteCustomPog = (pogId) => {
    const updated = customPogs.filter(p => p.id !== pogId);
    setCustomPogs(updated);
    saveCustomPogsToStorage(updated);
  };

  const startSelection = () => {
    setGameState('selection');
    setSelectedPogDesigns([]);
    setSelectionComplete(false);
  };

  const selectPog = (design) => {
    if (selectedPogDesigns.length < POGS_PER_GAME) {
      setSelectedPogDesigns([...selectedPogDesigns, design]);
      
      if (selectedPogDesigns.length + 1 === POGS_PER_GAME) {
        setTimeout(() => {
          setSelectionComplete(true);
          setTimeout(() => {
            setGameState('versus');
            setTimeout(startGame, 2500);
          }, 1000);
        }, 500);
      }
    }
  };

  const startGame = () => {
    const initialPogs = selectedPogDesigns.map((design, i) => ({
      id: `pog-${i}`,
      design: design,
      faceUp: false,
      owner: null,
      x: 50,
      y: 50,
      rotation: Math.random() * 360,
      flipProgress: 0,
      wobble: 0,
      flipDelay: 0
    }));
    
    setStackedPogs(initialPogs);
    setPlayerPogs([]);
    setComputerPogs([]);
    setPlayerScore(0);
    setComputerScore(0);
    setCurrentTurn('player');
    setGameState('playing');
    setIsProcessingTurn(false);
    setMessage('🎯 Your turn! Aim and unleash the slammer!');
    setShowAimGuide(true);
  };

  const createConfetti = () => {
    const pieces = Array(50).fill(null).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)],
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3000);
  };

  const throwSlammer = useCallback(() => {
    if (isThrowning || stackedPogs.length === 0 || isProcessingTurn) return;
    
    setIsThrowning(true);
    setIsProcessingTurn(true);
    setMessage('');
    setShowAimGuide(false);
    
    const targetX = 35 + (aimAngle / 100) * 30;
    const targetY = 50;
    const steps = 30;
    let step = 0;
    
    const animateSlammer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      setSlammerPos({
        x: 50 + (targetX - 50) * easeProgress,
        y: 20 + (targetY - 20) * easeProgress,
        z: Math.sin(progress * Math.PI) * 150,
        rotation: progress * 1080
      });
      
      if (step >= steps) {
        clearInterval(animateSlammer);
        handleImpact(targetX, targetY);
      }
    }, 20);
  }, [isThrowning, stackedPogs.length, isProcessingTurn, aimAngle]);

  const createParticles = (x, y) => {
    const newParticles = Array(30).fill(null).map((_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      return {
        id: Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 4 + Math.random() * 8,
        color: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#FF69B4', '#7B68EE'][Math.floor(Math.random() * 6)]
      };
    });
    
    setParticles(prev => [...prev, ...newParticles]);
    
    let frame = 0;
    const animateParticles = setInterval(() => {
      frame++;
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.3,
          y: p.y + p.vy * 0.3,
          life: p.life - 0.05,
          vy: p.vy + 0.5
        })).filter(p => p.life > 0)
      );
      
      if (frame > 40) clearInterval(animateParticles);
    }, 30);
  };

  const handleImpact = (impactX, impactY) => {
    setScreenShake(10);
    setTimeout(() => setScreenShake(0), 500);
    
    createParticles(impactX, impactY);
    
    const flipChance = power / 120;
    const centerDistance = Math.abs(impactX - 50);
    const aimAccuracy = Math.max(0, 1 - centerDistance / 20);
    const effectivePower = flipChance * (0.3 + aimAccuracy * 0.7);
    
    const baseFlips = Math.floor(stackedPogs.length * effectivePower);
    const numToFlip = Math.max(1, Math.min(baseFlips + (Math.random() > 0.5 ? 1 : 0), stackedPogs.length));
    
    const flipped = stackedPogs.slice(0, numToFlip);
    const remaining = stackedPogs.slice(numToFlip);
    
    const animatedFlipped = flipped.map((pog, i) => {
      const spreadAngle = (i / flipped.length) * Math.PI * 2;
      const distance = 15 + Math.random() * 25;
      return {
        ...pog,
        x: impactX + Math.cos(spreadAngle) * distance,
        y: impactY + Math.sin(spreadAngle) * distance,
        rotation: Math.random() * 360,
        faceUp: Math.random() > 0.4,
        flipProgress: 0,
        wobble: 1,
        flipDelay: i * 0.15
      };
    });
    
    setFlippingPogs(animatedFlipped);
    
    let flipStep = 0;
    const totalSteps = 80;
    const flipInterval = setInterval(() => {
      flipStep++;
      setFlippingPogs(prev => prev.map(pog => {
        const individualProgress = Math.max(0, Math.min(1, (flipStep - pog.flipDelay * 10) / 60));
        return {
          ...pog,
          flipProgress: individualProgress,
          wobble: Math.max(0, 1 - individualProgress)
        };
      }));
      
      if (flipStep >= totalSteps) {
        clearInterval(flipInterval);
        completeFlip(animatedFlipped, remaining);
      }
    }, 25);
  };

  const getShowcaseEffect = (count) => {
    if (count >= 5) return { text: 'EPIC!!!', color: '#FF1744', size: '120px' };
    if (count >= 4) return { text: 'FIRE!', color: '#FF6E40', size: '100px' };
    if (count >= 3) return { text: 'SICK!', color: '#FFEA00', size: '90px' };
    if (count >= 2) return { text: 'NICE!', color: '#00E5FF', size: '80px' };
    if (count >= 1) return { text: 'HIT!', color: '#00E676', size: '70px' };
    return { text: 'MISS!', color: '#666', size: '60px' };
  };

  const completeFlip = (flipped, remaining) => {
    const faceUpPogs = flipped.filter(pog => pog.faceUp);
    
    // Show the showcase effect
    setShowFlipShowcase(true);
    const effect = getShowcaseEffect(faceUpPogs.length);
    setShowcaseEffect(effect);
    
    // Wait longer to showcase the flipped pogs
    setTimeout(() => {
      if (currentTurn === 'player') {
        setPlayerPogs(prev => [...prev, ...faceUpPogs]);
        setPlayerScore(prev => prev + faceUpPogs.length);
        if (faceUpPogs.length > 3) {
          setMessage(`🔥 AWESOME! ${faceUpPogs.length} pogs flipped!`);
        } else if (faceUpPogs.length > 0) {
          setMessage(`✨ Nice! You got ${faceUpPogs.length} pog${faceUpPogs.length > 1 ? 's' : ''}!`);
        } else {
          setMessage('😅 Better luck next time! Computer\'s turn.');
        }
      } else {
        setComputerPogs(prev => [...prev, ...faceUpPogs]);
        setComputerScore(prev => prev + faceUpPogs.length);
        if (faceUpPogs.length > 3) {
          setMessage(`💻 Computer crushed it with ${faceUpPogs.length} pogs!`);
        } else if (faceUpPogs.length > 0) {
          setMessage(`🤖 Computer flipped ${faceUpPogs.length} pog${faceUpPogs.length > 1 ? 's' : ''}.`);
        } else {
          setMessage('🎯 Computer missed! Your turn!');
        }
      }
      
      setStackedPogs(remaining);
      setFlippingPogs([]);
      setSlammerPos({ x: 50, y: 20, z: 0, rotation: 0 });
      setIsThrowning(false);
      setShowFlipShowcase(false);
      setShowcaseEffect(null);
      
      if (remaining.length === 0) {
        setTimeout(() => {
          setIsProcessingTurn(false);
          endGame();
        }, 1000);
      } else {
        setTimeout(() => {
          // Switch turns and reset processing flag
          setCurrentTurn(prev => prev === 'player' ? 'computer' : 'player');
          setShowAimGuide(currentTurn === 'computer');
          setIsProcessingTurn(false);
        }, 1500);
      }
    }, 2500); // Increased from 500ms to 2500ms for dramatic effect
  };

  const endGame = () => {
    setGameState('gameOver');
    const winner = playerScore > computerScore ? 'player' : computerScore > playerScore ? 'computer' : 'tie';
    
    if (winner === 'player') {
      setMessage('🎉 CHAMPION! YOU WIN!');
      createConfetti();
    } else if (winner === 'computer') {
      setMessage('💻 Computer Wins This Round!');
    } else {
      setMessage('🤝 Epic Tie Game!');
    }
  };

  // Computer AI - fixed to only run when it's actually computer's turn
  useEffect(() => {
    if (
      gameState === 'playing' && 
      currentTurn === 'computer' && 
      !isThrowning && 
      !isProcessingTurn &&
      stackedPogs.length > 0
    ) {
      const computerThrow = setTimeout(() => {
        setAimAngle(35 + Math.random() * 30);
        setPower(60 + Math.random() * 30);
        setTimeout(() => {
          throwSlammer();
        }, 600);
      }, 1000);

      return () => clearTimeout(computerThrow);
    }
  }, [currentTurn, gameState, isThrowning, isProcessingTurn, stackedPogs.length, throwSlammer]);

  const Pog3D = ({ pog, index, isStacked }) => {
    const zIndex = isStacked ? stackedPogs.length - index : 100 + index;
    const stackHeight = isStacked ? index * 4 : 0;
    
    const flipRotation = pog.flipProgress * 540;
    const wobbleAmount = pog.wobble * Math.sin(Date.now() * 0.01) * 5;
    
    const bounceProgress = Math.sin(pog.flipProgress * Math.PI);
    const bounceHeight = isStacked ? 0 : bounceProgress * 120;
    
    const xRotation = isStacked ? 70 : 70 - (pog.flipProgress * 70);
    const showcaseScale = isStacked ? 1 : 1 + (bounceProgress * 0.5);
    
    return (
      <div style={{
        position: 'absolute',
        left: `${pog.x}%`,
        top: `${pog.y}%`,
        transform: `
          translate(-50%, calc(-50% - ${stackHeight + bounceHeight}px)) 
          rotateX(${xRotation}deg) 
          rotateZ(${pog.rotation + wobbleAmount}deg)
          scale(${showcaseScale})
        `,
        width: '110px',
        height: '110px',
        zIndex: zIndex,
        filter: pog.flipProgress > 0 ? `brightness(${1 + bounceProgress * 0.6}) drop-shadow(0 ${bounceHeight/4}px ${bounceHeight/2}px rgba(0,0,0,0.4))` : 'none'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: pog.design.isCustom 
            ? `url(${pog.design.image}) center/cover`
            : `linear-gradient(135deg, ${pog.design.bg} 0%, ${pog.design.secondary} 100%)`,
          border: '6px solid rgba(255, 255, 255, 0.95)',
          boxShadow: `
            0 ${isStacked ? 3 : 15}px ${isStacked ? 8 : 35}px rgba(0, 0, 0, 0.5),
            inset 0 3px 15px rgba(255, 255, 255, 0.4),
            inset 0 -3px 15px rgba(0, 0, 0, 0.3),
            0 0 ${pog.design.foil ? '30px' : '0px'} ${pog.design.foil ? 'rgba(255, 255, 255, 0.4)' : 'transparent'}
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transform: `rotateY(${flipRotation}deg)`
        }}>
          {pog.design.foil && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: `linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%)`,
              animation: 'shimmer 3s infinite linear',
              opacity: 0.6
            }} />
          )}
          
          {!pog.design.isCustom && (
            <>
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '15%',
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), transparent 60%)',
              }} />
              
              <div style={{
                fontSize: '56px',
                filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.6))',
                zIndex: 10,
                position: 'relative'
              }}>
                {pog.design.icon}
              </div>
              
              <div style={{
                position: 'absolute',
                width: '70%',
                height: '70%',
                border: '4px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                zIndex: 1
              }} />
            </>
          )}
        </div>
      </div>
    );
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return '#FFD700';
      case 'rare': return '#9D4EDD';
      case 'common': return '#00B4D8';
      case 'custom': return '#00E676';
      default: return '#FFFFFF';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '20px',
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(244, 114, 182, 0.1) 0%, transparent 50%)',
        animation: 'pulse 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {confetti.map(c => (
        <div key={c.id} style={{
          position: 'fixed',
          left: `${c.x}%`,
          top: `${c.y}%`,
          width: '10px',
          height: '10px',
          background: c.color,
          transform: `rotate(${c.rotation}deg)`,
          animation: 'confetti-fall 3s linear forwards',
          zIndex: 1000,
          pointerEvents: 'none'
        }} />
      ))}

      {/* Flip Showcase Effect */}
      {showFlipShowcase && showcaseEffect && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3000,
          pointerEvents: 'none',
          animation: 'showcase-zoom 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            fontSize: showcaseEffect.size,
            fontWeight: '900',
            color: showcaseEffect.color,
            textShadow: `
              0 0 20px ${showcaseEffect.color},
              0 0 40px ${showcaseEffect.color},
              0 0 60px ${showcaseEffect.color},
              0 10px 30px rgba(0, 0, 0, 0.8)
            `,
            letterSpacing: '10px',
            animation: 'text-glow 0.5s ease-in-out infinite alternate'
          }}>
            {showcaseEffect.text}
          </div>
        </div>
      )}

      {/* Custom Pog Creator Modal */}
      {showCustomPogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '40px',
            maxWidth: '600px',
            width: '100%',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCustomPogModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{
              color: 'white',
              fontSize: '36px',
              fontWeight: '900',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Create Custom Pog
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="pogImageUpload"
                />
                <label
                  htmlFor="pogImageUpload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  <Upload size={24} />
                  {uploadedImage ? 'Change Image' : 'Click to Upload'}
                </label>
              </div>

              {uploadedImage && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: `url(${uploadedImage}) center/cover`,
                    border: '6px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 230, 118, 0.6)'
                  }} />
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  Pog Name
                </label>
                <input
                  type="text"
                  value={pogName}
                  onChange={(e) => setPogName(e.target.value)}
                  placeholder="Enter pog name..."
                  maxLength={20}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '15px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={createCustomPog}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00E676, #00C853)',
                  color: 'white',
                  border: 'none',
                  padding: '20px',
                  fontSize: '20px',
                  fontWeight: '900',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0, 230, 118, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Create Pog
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'menu' && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '60px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(30px)',
            padding: '70px 50px',
            borderRadius: '40px',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.7)',
            marginBottom: '50px'
          }}>
            <div style={{
              fontSize: '100px',
              marginBottom: '30px',
              filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.7))',
              animation: 'bounce 2s ease-in-out infinite'
            }}>
              💥
            </div>
            
            <h1 style={{
              fontSize: '80px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4facfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 20px 0',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              POG BATTLE
            </h1>
            
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '26px', 
              margin: 0,
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              The Ultimate Showdown
            </p>
          </div>
          
          <button
            onClick={startSelection}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '28px 90px',
              fontSize: '32px',
              fontWeight: '900',
              borderRadius: '70px',
              cursor: 'pointer',
              boxShadow: '0 20px 50px rgba(102, 126, 234, 0.6)',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 30px 60px rgba(102, 126, 234, 0.8)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.6)';
            }}
          >
            ⚡ Select Pogs ⚡
          </button>
          
          <div style={{
            marginTop: '60px',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'left',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ 
              marginTop: 0,
              fontSize: '28px',
              fontWeight: '800',
              marginBottom: '25px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎮 How to Play
            </h3>
            <div style={{ display: 'grid', gap: '18px', fontSize: '17px', lineHeight: '1.6' }}>
              <div><strong>🎨 Customize:</strong> Create your own custom pogs (5 free!)</div>
              <div><strong>🎯 Select:</strong> Choose your pog collection for battle</div>
              <div><strong>🎯 Aim:</strong> Slide to target the perfect angle</div>
              <div><strong>💪 Power:</strong> Higher power = more pogs flip</div>
              <div><strong>💥 Throw:</strong> Launch your slammer!</div>
              <div><strong>🏆 Win:</strong> Collect the most face-up pogs</div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of game states - keeping the same but referencing the selection component */}
      {gameState === 'selection' && (
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          paddingTop: '40px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #FF1744, #F50057, #FF4081)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>
              SELECT YOUR POGS
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '24px',
              fontWeight: '600',
              letterSpacing: '2px',
              marginBottom: '20px'
            }}>
              {selectedPogDesigns.length} / {POGS_PER_GAME} SELECTED
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px',
              background: 'rgba(0, 230, 118, 0.1)',
              padding: '15px 30px',
              borderRadius: '50px',
              border: '2px solid rgba(0, 230, 118, 0.3)'
            }}>
              <div style={{
                color: '#00E676',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                Custom Pogs: {customPogs.length} / {MAX_FREE_CUSTOM_POGS}
              </div>
              {customPogs.length < MAX_FREE_CUSTOM_POGS ? (
                <button
                  onClick={() => setShowCustomPogModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #00E676, #00C853)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Plus size={18} />
                  Create New
                </button>
              ) : (
                <button
                  onClick={() => alert('Upgrade to unlock more slots! (Payment integration coming soon)')}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Lock size={18} />
                  Unlock More
                </button>
              )}
            </div>
          </div>

          <div style={{
            maxWidth: '800px',
            margin: '0 auto 40px',
            background: 'rgba(0, 0, 0, 0.4)',
            height: '20px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              height: '100%',
              width: `${(selectedPogDesigns.length / POGS_PER_GAME) * 100}%`,
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
              transition: 'width 0.3s ease-out'
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {allPogDesigns.map((design, idx) => {
              const selectCount = selectedPogDesigns.filter(d => d === design).length;
              
              return (
                <div
                  key={design.id || idx}
                  onClick={() => !selectionComplete && selectPog(design)}
                  onMouseEnter={() => setHoveredPog(idx)}
                  onMouseLeave={() => setHoveredPog(null)}
                  style={{
                    background: hoveredPog === idx 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                    backdropFilter: 'blur(20px)',
                    padding: '25px',
                    borderRadius: '20px',
                    border: selectCount > 0
                      ? `3px solid ${getRarityColor(design.rarity)}`
                      : `2px solid rgba(255, 255, 255, 0.1)`,
                    cursor: selectionComplete ? 'default' : 'pointer',
                    transition: 'all 0.3s',
                    transform: hoveredPog === idx && !selectionComplete ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredPog === idx 
                      ? `0 20px 60px ${getRarityColor(design.rarity)}40`
                      : selectCount > 0
                      ? `0 10px 40px ${getRarityColor(design.rarity)}30`
                      : '0 10px 30px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {design.foil && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(45deg, transparent 30%, ${getRarityColor(design.rarity)}40 50%, transparent 70%)`,
                      animation: 'shimmer 3s infinite linear',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {selectCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getRarityColor(design.rarity)}, ${design.bg || '#667eea'})`,
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '900',
                      color: 'white',
                      zIndex: 10
                    }}>
                      {selectCount}
                    </div>
                  )}

                  {design.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPog(design.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 0, 0, 0.8)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'white'
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}

                  <div style={{
                    width: '140px',
                    height: '140px',
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: design.isCustom 
                      ? `url(${design.image}) center/cover`
                      : `linear-gradient(135deg, ${design.bg}, ${design.secondary})`,
                    border: '6px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: `
                      0 15px 40px rgba(0, 0, 0, 0.5),
                      inset 0 3px 15px rgba(255, 255, 255, 0.4),
                      0 0 ${design.foil ? '40px' : '0px'} ${design.foil ? getRarityColor(design.rarity) + '60' : 'transparent'}
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: hoveredPog === idx ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    transition: 'transform 0.3s ease-out'
                  }}>
                    {!design.isCustom && (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: '10%',
                          left: '15%',
                          width: '40%',
                          height: '40%',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), transparent 60%)',
                        }} />
                        <div style={{
                          fontSize: '70px',
                          filter: 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.6))',
                          zIndex: 2
                        }}>
                          {design.icon}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      color: getRarityColor(design.rarity),
                      fontSize: '12px',
                      fontWeight: '800',
                      letterSpacing: '2px',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {design.rarity}
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}>
                      {design.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectionComplete && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #00E676, #00C853)',
                color: 'white',
                padding: '20px 50px',
                borderRadius: '50px',
                fontSize: '32px',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                boxShadow: '0 10px 40px rgba(0, 230, 118, 0.6)'
              }}>
                ✓ READY FOR BATTLE!
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'versus' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '100px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <User size={120} color="#00E676" strokeWidth={3} />
              <div style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: '900',
                marginTop: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                YOU
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Swords size={160} color="#FF1744" strokeWidth={3} />
              <div style={{
                position: 'absolute',
                top: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '80px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #FF1744, #F50057, #FF4081)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>
                VS
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Cpu size={120} color="#FF4081" strokeWidth={3} />
              <div style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: '900',
                marginTop: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                COMPUTER
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          position: 'relative', 
          zIndex: 1,
          transform: `translate(${Math.sin(screenShake * 0.5) * screenShake}px, ${Math.cos(screenShake * 0.7) * screenShake}px)`
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '25px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: currentTurn === 'player' 
                ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.25) 0%, rgba(56, 249, 215, 0.15) 100%)' 
                : 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(20px)',
              padding: '30px',
              borderRadius: '24px',
              border: currentTurn === 'player' 
                ? '3px solid rgba(67, 233, 123, 0.6)' 
                : '2px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.4s',
              boxShadow: currentTurn === 'player' 
                ? '0 15px 50px rgba(67, 233, 123, 0.4)' 
                : '0 8px 25px rgba(0, 0, 0, 0.3)',
              transform: currentTurn === 'player' ? 'scale(1.02)' : 'scale(1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '18px' }}>
                <User size={32} color="white" strokeWidth={2.5} />
                <h3 style={{ color: 'white', margin: 0, fontSize: '26px', fontWeight: '800' }}>You</h3>
              </div>
              <p style={{ 
                color: 'white', 
                fontSize: '64px', 
                fontWeight: '900', 
                margin: '0 0 20px 0',
                letterSpacing: '2px'
              }}>
                {playerScore}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {playerPogs.map((pog, i) => (
                  <div key={i} style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: pog.design.isCustom 
                      ? `url(${pog.design.image}) center/cover`
                      : `linear-gradient(135deg, ${pog.design.bg}, ${pog.design.secondary})`,
                    border: '3px solid white',
                    boxShadow: i >= playerPogs.length - 4 ? '0 0 20px rgba(67, 233, 123, 0.8)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {!pog.design.isCustom && pog.design.icon}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: currentTurn === 'computer' 
                ? 'linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(236, 72, 153, 0.15) 100%)' 
                : 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(20px)',
              padding: '30px',
              borderRadius: '24px',
              border: currentTurn === 'computer' 
                ? '3px solid rgba(244, 114, 182, 0.6)' 
                : '2px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.4s',
              boxShadow: currentTurn === 'computer' 
                ? '0 15px 50px rgba(244, 114, 182, 0.4)' 
                : '0 8px 25px rgba(0, 0, 0, 0.3)',
              transform: currentTurn === 'computer' ? 'scale(1.02)' : 'scale(1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '18px' }}>
                <Cpu size={32} color="white" strokeWidth={2.5} />
                <h3 style={{ color: 'white', margin: 0, fontSize: '26px', fontWeight: '800' }}>Computer</h3>
              </div>
              <p style={{ 
                color: 'white', 
                fontSize: '64px', 
                fontWeight: '900', 
                margin: '0 0 20px 0',
                letterSpacing: '2px'
              }}>
                {computerScore}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {computerPogs.map((pog, i) => (
                  <div key={i} style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: pog.design.isCustom 
                      ? `url(${pog.design.image}) center/cover`
                      : `linear-gradient(135deg, ${pog.design.bg}, ${pog.design.secondary})`,
                    border: '3px solid white',
                    boxShadow: i >= computerPogs.length - 4 ? '0 0 20px rgba(244, 114, 182, 0.8)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {!pog.design.isCustom && pog.design.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {message && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
              color: 'white',
              padding: '22px 35px',
              borderRadius: '20px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '30px',
              boxShadow: '0 10px 35px rgba(102, 126, 234, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              {message}
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.7) 0%, rgba(20, 20, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '60px',
            position: 'relative',
            height: '600px',
            overflow: 'hidden',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            perspective: '1200px'
          }}>
            {showAimGuide && currentTurn === 'player' && !isThrowning && (
              <div style={{
                position: 'absolute',
                left: `${35 + (aimAngle / 100) * 30}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '140px',
                height: '140px',
                border: '4px dashed rgba(67, 233, 123, 0.6)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 50
              }}>
                <Target style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'rgba(67, 233, 123, 0.8)',
                  width: '40px',
                  height: '40px'
                }} />
              </div>
            )}

            {particles.map(p => (
              <div key={p.id} style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 20px ${p.color}`,
                opacity: p.life,
                pointerEvents: 'none',
                zIndex: 150
              }} />
            ))}

            <div style={{
              position: 'absolute',
              left: `${slammerPos.x}%`,
              top: `${slammerPos.y}%`,
              transform: `translate(-50%, calc(-50% - ${slammerPos.z}px)) rotateX(60deg) rotateZ(${slammerPos.rotation}deg)`,
              width: '120px',
              height: '120px',
              zIndex: 200,
              transition: slammerPos.z === 0 ? 'all 0.3s' : 'none'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: '8px solid #FF8C00',
                boxShadow: 'inset 0 4px 20px rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: '900'
              }}>
                💥
              </div>
            </div>

            {stackedPogs.map((pog, index) => (
              <Pog3D key={pog.id} pog={pog} index={index} isStacked={true} />
            ))}

            {flippingPogs.map((pog, index) => (
              <Pog3D key={pog.id} pog={pog} index={index} isStacked={false} />
            ))}
          </div>

          {currentTurn === 'player' && !isThrowning && !isProcessingTurn && stackedPogs.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              marginTop: '30px',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                  color: 'white', 
                  fontWeight: '800', 
                  display: 'block', 
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  🎯 Aim Angle: <span style={{ color: '#667eea', fontSize: '22px' }}>{aimAngle}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aimAngle}
                  onChange={(e) => setAimAngle(Number(e.target.value))}
                  style={{ 
                    width: '100%', 
                    height: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '35px' }}>
                <label style={{ 
                  color: 'white', 
                  fontWeight: '800', 
                  display: 'block', 
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  💪 Power: <span style={{ color: '#43e97b', fontSize: '22px' }}>{power}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  style={{ 
                    width: '100%', 
                    height: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <button
                onClick={throwSlammer}
                disabled={isProcessingTurn}
                style={{
                  width: '100%',
                  background: isProcessingTurn 
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '26px',
                  fontSize: '30px',
                  fontWeight: '900',
                  borderRadius: '18px',
                  cursor: isProcessingTurn ? 'not-allowed' : 'pointer',
                  boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  opacity: isProcessingTurn ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!isProcessingTurn) {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              >
                ⚡ THROW SLAMMER ⚡
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'gameOver' && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '80px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            background: playerScore > computerScore 
              ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.25) 0%, rgba(56, 249, 215, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
            backdropFilter: 'blur(30px)',
            padding: '70px 60px',
            borderRadius: '40px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 40px 100px rgba(0, 0, 0, 0.7)',
            marginBottom: '50px'
          }}>
            <Trophy size={100} color="white" style={{ marginBottom: '30px' }} />
            
            <h1 style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              margin: '0 0 40px 0',
              letterSpacing: '2px'
            }}>
              {message}
            </h1>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '80px',
              fontSize: '28px',
              color: 'white',
              fontWeight: '800'
            }}>
              <div>
                <div style={{ marginBottom: '15px', fontSize: '22px' }}>You</div>
                <div style={{ fontSize: '72px', fontWeight: '900' }}>{playerScore}</div>
              </div>
              
              <div style={{ fontSize: '60px', opacity: 0.4 }}>VS</div>
              
              <div>
                <div style={{ marginBottom: '15px', fontSize: '22px' }}>Computer</div>
                <div style={{ fontSize: '72px', fontWeight: '900' }}>{computerScore}</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setGameState('menu');
              setSelectedPogDesigns([]);
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '28px 80px',
              fontSize: '30px',
              fontWeight: '900',
              borderRadius: '70px',
              cursor: 'pointer',
              boxShadow: '0 20px 50px rgba(102, 126, 234, 0.6)',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            <RotateCcw size={32} strokeWidth={3} />
            Play Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes showcase-zoom {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          20% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 1;
          }
          80% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
        }

        @keyframes text-glow {
          from {
            text-shadow: 
              0 0 20px currentColor,
              0 0 40px currentColor,
              0 0 60px currentColor,
              0 10px 30px rgba(0, 0, 0, 0.8);
          }
          to {
            text-shadow: 
              0 0 30px currentColor,
              0 0 60px currentColor,
              0 0 90px currentColor,
              0 10px 30px rgba(0, 0, 0, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default VirtualPogGame;
