import { motion, AnimatePresence } from 'framer-motion';
import type { TicketChecklist } from '../types/ticket';
import styles from './TradeMachine.module.css';

interface TradeMachineProps {
    checklist?: TicketChecklist;
    statusLabel?: string;
}

export default function TradeMachine({ checklist, statusLabel = 'Giao dịch đang diễn ra' }: TradeMachineProps) {
    // Map checklist items to ball presence
    const sExported = !!checklist?.seller_delivered;
    const sVerified = !!checklist?.identity_verified;
    const bExported = !!checklist?.buyer_paid;
    const bVerified = !!checklist?.buyer_confirmed;
    
    // Final state
    const isCompleted = !!checklist?.seller_received_payment;

    return (
        <div className={styles.machineContainer}>
            {/* LCD Header */}
            <div className={styles.lcdScreen}>
                <div className={styles.lcdTitle}>Global Trade Machine GTI-300</div>
                <div className={`${styles.lcdStatus} ${isCompleted ? styles.completed : ''}`}>
                    {isCompleted ? 'GIAO DỊCH HOÀN TẤT' : statusLabel}
                </div>
            </div>

            {/* Trading Slots Area */}
            <div className={styles.slotsArea}>
                {/* Seller Slot (Left) */}
                <div className={styles.slot}>
                    <div className={styles.cylinder} />
                    
                    <AnimatePresence>
                        {sExported && (
                            <motion.div 
                                className={`${styles.ball} ${sVerified ? styles.verified : ''}`}
                                initial={{ y: -200, opacity: 0, scale: 0.5 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                            >
                                <div className={styles.ballCenter} />
                                <div className={styles.ballButton} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.platform}>
                        <div className={`${styles.lightRing} ${sExported ? styles.active : ''} ${sVerified ? styles.verified : ''}`} />
                    </div>
                    <div className={styles.label}>Seller Node</div>
                </div>

                {/* Buyer Slot (Right) */}
                <div className={styles.slot}>
                    <div className={styles.cylinder} />
                    
                    <AnimatePresence>
                        {bExported && (
                            <motion.div 
                                className={`${styles.ball} ${styles.blue} ${bVerified ? styles.verified : ''}`}
                                initial={{ y: -200, opacity: 0, scale: 0.5 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                            >
                                <div className={styles.ballCenter} />
                                <div className={styles.ballButton} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.platform}>
                        <div className={`${styles.lightRing} ${bExported ? styles.active : ''} ${bVerified ? styles.verified : ''}`} />
                    </div>
                    <div className={styles.label}>Buyer Node</div>
                </div>
            </div>
            
            {/* Base Deco */}
            <div className={styles.footerDeco}>
                SECURE EXCHANGE PROTOCOL v2.4 • POKEBALL TRADING SYSTEM
            </div>
        </div>
    );
}
