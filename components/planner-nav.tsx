'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function PlannerNav(){const path=usePathname();return <nav className="planner-nav" aria-label="Project builders">{[['/planner','Watch box'],['/planner/cabinet','Cabinet']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>;}
