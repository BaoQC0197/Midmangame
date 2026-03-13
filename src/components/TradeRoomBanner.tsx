import { Video, ExternalLink } from 'lucide-react';
import type { TransactionTicket } from '../types/ticket';
import styles from './TradeRoomBanner.module.css';

interface TradeRoomBannerProps {
    ticket: TransactionTicket;
}

export default function TradeRoomBanner({ ticket }: TradeRoomBannerProps) {
    if (!ticket.room_url) return null;

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
                    <a
                        href={ticket.room_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.joinBtn}
                    >
                        <Video size={15} />
                        Tham gia phòng
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
}
