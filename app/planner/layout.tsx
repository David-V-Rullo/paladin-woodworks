import type {Metadata} from 'next';
import './planner.css';
import PlannerNav from '@/components/planner-nav';
export const metadata:Metadata={title:'Watch Box Planner | Paladin Woodworks',description:'Configure a watch box, compare construction choices, and download a cut list.'};
export default function PlannerLayout({children}:{children:React.ReactNode}){return <><PlannerNav/>{children}</>;}
