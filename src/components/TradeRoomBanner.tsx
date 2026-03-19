import { MessageSquare } from 'lucide-react';
import type { TransactionTicket } from '../types/ticket';
import styles from './TradeRoomBanner.module.css';

interface TradeRoomBannerProps {
    ticket: TransactionTicket;
}

export default function TradeRoomBanner({ ticket }: TradeRoomBannerProps) {
    // Luôn hiển thị nếu có ticket, vì Jitsi room_url có thể không còn cần thiết
    if (!ticket) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.inner}>
                <div className={styles.card}>
                    <div className={styles.liveDot} />
                    <div className={styles.info}>
                        <div className={styles.title}>
                            🎙️ Bạn có phiên giao dịch đang diễn ra!
                        </div>
                        <div className={styles.sub}>
                            {ticket.account_title
                                ? `${ticket.account_title} • `
                                : ''
                            }
                            Mã: #{ticket.id.slice(0, 8).toUpperCase()}
                        </div>
                    </div>
                    <div className={styles.joinBtn}>
                        <MessageSquare size={15} />
                        Vào phòng chat
                    </div>
                </div>
            </div>
        </div>
    );
}

