import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronDown, Gift } from 'lucide-react';
import styles from './SpinWheel.module.css';
import { useSpinTurn } from '../api/profiles';

interface SpinWheelProps {
    userId: string;
    accountId: string;
    accountTitle: string;
    accountThumb: string;
    spinTurns: number;
    onClose: () => void;
    onSuccess: () => void;
}

const REWARDS = [
    { label: 'Hot 3 ngày', type: 'hot', value: 3, weight: 20, color: '#a855f7' },
    { label: 'Hot 5 ngày', type: 'hot', value: 5, weight: 15, color: '#ec4899' },
    { label: 'Hot 7 ngày', type: 'hot', value: 7, weight: 10, color: '#ef4444' },
    { label: 'Giảm 50% phí', type: 'discount', value: 0.05, weight: 5, color: '#10b981' },
    { label: 'Chúc bạn may mắn', type: 'none', value: 0, weight: 50, color: '#4b5563' },
];

export default function SpinWheel({ userId, accountId, accountTitle, accountThumb, spinTurns, onClose, onSuccess }: SpinWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSpin = async () => {
        if (spinTurns <= 0 || isSpinning) return;

        setIsSpinning(true);

        // Random kết quả dựa trên trọng số
        const totalWeight = REWARDS.reduce((acc, r) => acc + r.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;

        for (let i = 0; i < REWARDS.length; i++) {
            if (random < REWARDS[i].weight) {
                selectedIndex = i;
                break;
            }
            random -= REWARDS[i].weight;
        }

        const selectedReward = REWARDS[selectedIndex];

        // Tính toán góc xoay (360 / số phần thưởng * index) + (vòng xoay tối thiểu)
        const segmentAngle = 360 / REWARDS.length;
        const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 vòng
        const endRotation = rotation + (extraSpins * 360) + (360 - (selectedIndex * segmentAngle));

        setRotation(endRotation);

        // Đợi hiệu ứng quay kết thúc (3s)
        setTimeout(async () => {
            setIsSpinning(false);
            setResult(selectedReward);

            try {
                setLoading(true);
                await useSpinTurn(userId, accountId, {
                    type: selectedReward.type as any,
                    value: selectedReward.value
                });
                onSuccess();
            } catch (err) {
                console.error('Lỗi khi lưu kết quả quay:', err);
            } finally {
                setLoading(false);
            }
        }, 4000);
    };

    return (
        <div className={styles.overlay}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={styles.modal}
            >
                <button className={styles.closeBtn} onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <div className={styles.glow} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                    <Sparkles className="text-primary" />
                    <h2 style={{ fontSize: 24, margin: 0 }}>Vòng Quay May Mắn</h2>
                </div>
                <p style={{ color: 'var(--color-text-dim)', marginBottom: 20 }}>Bạn đang có <b>{spinTurns}</b> lượt quay</p>

                <div className={styles.itemInfo}>
                    <img src={accountThumb} className={styles.itemThumb} alt="" />
                    <div>
                        <div className={styles.itemTitle}>{accountTitle}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>Đang áp dụng quay thưởng</div>
                    </div>
                </div>

                <div className={styles.wheelContainer}>
                    <div className={styles.pointer}>
                        <ChevronDown size={48} fill="currentColor" />
                    </div>

                    <motion.div
                        className={styles.wheel}
                        animate={{ rotate: rotation }}
                        transition={{ duration: 5, ease: [0.13, 0, 0, 1] }}
                        style={{
                            background: `conic-gradient(${REWARDS.map((r, i) => `${r.color} ${(i * 360) / REWARDS.length}deg ${((i + 1) * 360) / REWARDS.length}deg`).join(', ')})`
                        }}
                    >
                        {REWARDS.map((r, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) rotate(${(i * 360) / REWARDS.length + (360 / REWARDS.length / 2)}deg) translateY(-120px)`,
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    textAlign: 'center',
                                    width: 100,
                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                    pointerEvents: 'none'
                                }}
                            >
                                {r.label}
                            </div>
                        ))}
                    </motion.div>
                    <div className={styles.wheelCenter}>
                        <Gift size={24} />
                    </div>
                </div>

                <button
                    className={styles.spinBtn}
                    onClick={handleSpin}
                    disabled={isSpinning || spinTurns <= 0}
                >
                    {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
                </button>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={styles.resultOverlay}
                        >
                            <div className={styles.rewardIcon}>
                                {result.type === 'none' ? <Gift size={64} opacity={0.5} /> : <Sparkles size={64} />}
                            </div>
                            <h3 className={styles.rewardTitle}>
                                {result.type === 'none' ? 'Tiếc quá!' : 'Chúc mừng!'}
                            </h3>
                            <p className={styles.rewardDesc}>
                                {result.type === 'none'
                                    ? 'Lần sau sẽ may mắn hơn nhé.'
                                    : `Bạn đã trúng ${result.label} cho tài khoản này!`}
                            </p>
                            <button
                                className="btn-premium"
                                onClick={onClose}
                                style={{ padding: '12px 30px' }}
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Tuyệt vời'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
