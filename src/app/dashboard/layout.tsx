import { Header } from './components/header';
import MenuLeft from "./components/menuLeft";
import styles from './page.module.scss';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div>
                <Header />
                
            </div>
            <div className={styles.container}>
                
                <div className={styles.dividerLeft}></div>
                <MenuLeft />
                <div className={styles.divider}></div>
                <div style={{ flex: 1, marginLeft: 5 }}>
                    {children}
                </div>
                <div className={styles.divider}></div>
            </div>
            <div id="tooltip-container"></div>
        </>
    );
}
