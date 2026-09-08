'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function SiteHeader(){const path=usePathname();return <><a href="#main-content" className="skip-link">Skip to content</a><header className="site-header"><Link href="/" className="brand" aria-label="Paladin Woodworks home"><img className="brand-logo" src="/paladin-logo.png" width="1374" height="1145" alt="Paladin Woodworks — armored gauntlet holding a chisel"/></Link><nav aria-label="Main navigation">{[['/','Home'],['/portfolio','Portfolio'],['/about','About'],['/planner','The planner']].map(([url,label])=><Link key={url} href={url} className={path===url?'active':''} aria-current={path===url?'page':undefined}>{label}</Link>)}</nav><span className="edition">WOODWORK & DESIGN</span></header><div id="main-content" tabIndex={-1}/></>}
