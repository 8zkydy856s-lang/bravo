import Link from "next/link";
import Image from "next/image";
import BravoNapis from "./BravoNapis";
import KioskStatus from "./KioskStatus";
import Pocasi from "./Pocasi";
import { LangProvider, T } from "./LangContext";
import JazykPrepinac from "./JazykPrepinac";
import { InstagramIkona, GoogleIkona } from "./Ikony";
import { WebObsahProvider, Sdeleni, ZitraVyhled, PopisText, NavigujOdkaz } from "./WebObsah";
import VozikZivot from "./VozikZivot";
import ProvozZivot from "./ProvozZivot";
import PodtitulStruna from "./PodtitulStruna";
import Orchestrace from "./Orchestrace";
import LayoutEditor from "./LayoutEditor";
// Fáze 1: AuthBar a TrustCard zůstávají v projektu, na veřejné úvodní stránce se zatím nevykreslují.
// import AuthBar from "./AuthBar";
// import TrustCard from "./TrustCard";

// E-mail dole - odkrytý.
const ZOBRAZIT_EMAIL = true;
const EMAIL = "hello@bra-vo.com";

// Společný styl pro tři odkazy dole - tmavé, kontrastní, s ikonkou.
const odkazStyle: React.CSSProperties = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
  padding: "12px 6px", borderRadius: "12px", border: "none", background: "#4d4030",
  fontSize: "13px", color: "#f6f1e6", textDecoration: "none", whiteSpace: "nowrap"
};

export default function Home() {
  return (
    <main className="landing" style={{minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      <LangProvider>
      <WebObsahProvider>

      {/* 1) Přepínač jazyků - funkční */}
      <div style={{display:"flex",justifyContent:"flex-end",padding:"2px 16px 0"}}>
        <JazykPrepinac />
      </div>

      {/* 2) Hlavička - nápis BraVo + podtitul, vycentrované na 50% osy, výš a těsně */}
      <header style={{padding:"0 16px 4px",display:"flex",flexDirection:"column",alignItems:"center",marginTop:"-6px",transform:"translate(-19px,-10px)"}}>
        <BravoNapis className="bravo-napis" priority />
        <PodtitulStruna />
      </header>

      {/* 3) Vozík BRAVO - průhledné PNG, jemně oživené (dýchání + padající plátky) */}
      <div className="landing-photo" style={{lineHeight:0,marginTop:"-9px",transform:"translateX(2px)"}}>
        <Image className="fx-vozik" src="/vozik-ikona.png" alt="Vozík BRAVO" width={1025} height={750} priority />
        <VozikZivot />
      </div>

      {/* 4+5) Vlídný text o provozu + karta stavu */}
      <div className="landing-band" style={{marginTop:"-14px"}}>
        {/* 4) Text o provozu - ŽIVÝ: záměrné řádkování + morf věty 2 (ze simulátoru) */}
        <ProvozZivot />

        {/* pravý sloupec: sdělení 1 + karta stavu */}
        <div className="landing-band-status">
          <Sdeleni pozice={1} style={{margin:"0 0 12px"}} />

          {/* 5) Stav kiosku + reálné počasí */}
          <div style={{background:"#fffdf8",borderRadius:"18px",border:"0.5px solid rgba(120,90,40,0.12)",overflow:"hidden"}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontSize:"10px",letterSpacing:"0.15em",color:"#9b8d76",margin:"0 0 6px"}}><T k="praveTed" /></p>
                <KioskStatus />
                <ZitraVyhled />
              </div>
              <Pocasi />
            </div>
          </div>
        </div>
      </div>

      {/* Sdělení 2 */}
      <Sdeleni pozice={2} className="landing-sdeleni" />

      {/* 6) Popis kurzívou - přeložený ze slovníku */}
      <div className="landing-desc">
        <PopisText />
      </div>

      {/* Sdělení 3 */}
      <Sdeleni pozice={3} className="landing-sdeleni" />

      {/* 7) Nápojový lístek -> /listek, užší a vycentrovaný */}
      <div className="landing-cta">
        <Link href="/listek" style={{display:"inline-block",boxSizing:"border-box",textAlign:"center",background:"none",color:"#1a1208",border:"1px solid #d8c8ad",borderRadius:"14px",padding:"12px 56px",fontSize:"14px",fontWeight:500,textDecoration:"none",fontFamily:"Inter,sans-serif"}}>
          <T k="napojovyListek" />
        </Link>
      </div>

      {/* 8) Tři odkazy - tmavé, s ikonkami (Instagram, Google natvrdo; Následuj mě z DB) */}
      <div className="landing-links">
        <a href="https://www.instagram.com/bravo_cafe_luxembourg/" target="_blank" rel="noopener noreferrer" style={odkazStyle}><InstagramIkona /><span>Instagram</span></a>
        <a href="https://share.google/Ch9TWlQZ4HTd6gRpP" target="_blank" rel="noopener noreferrer" style={odkazStyle}><GoogleIkona /><span>Google</span></a>
        <NavigujOdkaz style={odkazStyle} />
      </div>

      {/* 9) E-mail - odkrytý */}
      {ZOBRAZIT_EMAIL && (
        <p style={{margin:"16px 16px 0",textAlign:"center",fontSize:"16px"}}>
          <a href={`mailto:${EMAIL}`} style={{color:"#9c7c33",textDecoration:"none"}}>{EMAIL}</a>
        </p>
      )}

      {/* 10) Jemné "... a brzy přijde víc" - přeložené, s větším zářícím smajlíkem */}
      <p style={{margin:"16px 16px 0",textAlign:"center",fontSize:"14.5px",color:"#574b3a",letterSpacing:"0.02em"}}>
        <T k="aBrzyPrijdeVic" /> <span className="brzy-emoji" aria-hidden="true">😌</span>
      </p>

      {/* 11) Nenápadný vstup pro majitele - přeložený, posunutý níž */}
      <div style={{marginTop:"56px",textAlign:"center"}}>
        <a href="/login" style={{fontSize:"12px",color:"#9a8e7c",textDecoration:"none",letterSpacing:"0.04em"}}><T k="vstupProMajitele" /></a>
      </div>

      {/*
        Skryto pro Fázi 1 (ponecháno v projektu, jen se nevykresluje):

        Bravo Rádio:
        <div style={{margin:"12px 16px 0",background:"#1a1208",borderRadius:"16px",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(184,149,74,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>🎵</div>
            <div>
              <p style={{fontSize:"12px",color:"#d4a96a",fontWeight:"500",margin:0}}>Bravo Rádio</p>
              <p style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",margin:0}}>Poslouchejte co hraje u kiosku</p>
            </div>
          </div>
          <button style={{width:"32px",height:"32px",borderRadius:"50%",background:"#b8954a",border:"none",color:"white",fontSize:"14px",cursor:"pointer"}}>▶</button>
        </div>

        Spodní navigační lišta:
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:"#1a1208",borderTop:"0.5px solid rgba(255,255,255,0.07)",display:"flex"}}>
          {["DOMOV","MENU","KVETY","KOSIK","PROFIL"].map((tab,i) => (
            <button key={tab} style={{flex:1,padding:"18px 6px 24px",border:"none",background:"none",fontSize:"11px",letterSpacing:"0.06em",cursor:"pointer",color:i===0?"#d4a96a":"rgba(255,255,255,0.3)"}}>{tab}</button>
          ))}
        </nav>
      */}

      <Orchestrace />
      <LayoutEditor />

      </WebObsahProvider>
      </LangProvider>
    </main>
  );
}
