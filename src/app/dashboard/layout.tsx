import { Header } from './components/header';
import  MenuLeft  from "./components/menuLeft";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            
            <div>
                <Header />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <MenuLeft />
                
                    {children}
                
            </div>
        </>
    );
}