import Link from "next/link";
import Image from "next/image";
import BravoNapis from "./BravoNapis";
import KioskStatus from "./KioskStatus";
import Pocasi from "./Pocasi";
import { WebObsahProvider, Sdeleni, ZitraVyhled, ProvozText, PopisText, NavigujOdkaz } from "./WebObsah";
// Fáze 1: AuthBar a TrustCard zůstávají v projektu, na veřejné úvodní stránce se zatím nevykreslují.
// import AuthBar from "./AuthBar";
// import TrustCard from "./TrustCard";

// E-mail jde snadno skrýt/zobrazit touto jednou konstantou. Fáze 1: skrytý.
const ZOBRAZIT_EMAIL = false;
const EMAIL = "hello@bra-vo.com";

// Společný styl pro tři odkazy dole - tmavé, kontrastní, světlý text.
const odkazStyle: React.CSSProperties = {
  flex: 1, textAlign: "center", padding: "12px 6px", borderRadius: "12px",
  border: "none", background: "#2e2418", fontSize: "12px",
  color: "#f6f1e6", textDecoration: "none"
};

export default function Home() {
  return (
    <main className="landing" style={{minHeight:"100vh",background:"#f6f1e6",fontFamily:"Inter,sans-serif"}}>
      <WebObsahProvider>

      {/* 1) Přepínač jazyků - zatím jen vizuální placeholder (nefunkční) */}
      <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 16px 0"}}>
        <span style={{fontSize:"11px",letterSpacing:"0.1em",color:"#b6ab9b"}}>EN · FR · DE · LU · CZ</span>
      </div>

      {/* 2) Hlavička - nápis BraVo + podtitul, vycentrované */}
      <header style={{padding:"8px 20px 6px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <BravoNapis className="bravo-napis" priority />
        <p style={{fontSize:"12px",color:"#9b8d76",letterSpacing:"0.14em",marginTop:"8px"}}>místo k zastavení</p>
      </header>

      {/* 3) Vozík BRAVO - průhledné PNG bez rámečku, splývá s krémovým pozadím */}
      <div className="landing-photo" style={{lineHeight:0}}>
        <Image src="/vozik-ikona.png" alt="Vozík BRAVO" width={1025} height={750} priority style={{width:"100%",height:"auto",display:"block"}} />
      </div>

      {/* 4+5) Vlídný text o provozu + karta stavu (na desktopu vedle sebe) */}
      <div className="landing-band">
        {/* 4) Vlídné vysvětlení provozu (text z DB, editovatelné v adminu) */}
        <ProvozText />

        {/* pravý sloupec: sdělení 1 (nad statusem) + karta stavu */}
        <div className="landing-band-status">
          {/* Sdělení 1 - nad statusem */}
          <Sdeleni pozice={1} style={{margin:"0 0 8px"}} />

          {/* 5) Stav kiosku + reálné počasí (svisle vycentrované) */}
          <div style={{background:"#fffdf8",borderRadius:"18px",border:"0.5px solid rgba(120,90,40,0.12)",overflow:"hidden"}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontSize:"9px",letterSpacing:"0.15em",color:"#9b8d76",margin:"0 0 6px"}}>PRÁVĚ TEĎ</p>
                <KioskStatus />
                {/* Výhled na zítřek - text z web_obsah */}
                <ZitraVyhled />
              </div>
              {/* Reálné počasí (Open-Meteo); při výpadku se nezobrazí */}
              <Pocasi />
            </div>
          </div>
        </div>
      </div>

      {/* Sdělení 2 - mezi statusem a popisem */}
      <Sdeleni pozice={2} className="landing-sdeleni" />

      {/* 6) Krátký popis kurzívou - z DB, editovatelné v adminu */}
      <div className="landing-desc">
        <PopisText />
      </div>

      {/* Sdělení 3 - pod popisem */}
      <Sdeleni pozice={3} className="landing-sdeleni" />

      {/* 7+8) Nápojový lístek -> /listek, užší a vycentrovaný */}
      <div className="landing-cta">
        <Link href="/listek" style={{display:"inline-block",boxSizing:"border-box",textAlign:"center",background:"none",color:"#1a1208",border:"1px solid #d8c8ad",borderRadius:"14px",padding:"12px 34px",fontSize:"13px",fontWeight:500,textDecoration:"none",fontFamily:"Inter,sans-serif"}}>
          Nápojový lístek
        </Link>
      </div>

      {/* 8) Tři odkazy vedle sebe - tmavé (Instagram, Google natvrdo; Naviguj z DB) */}
      <div className="landing-links">
        <a href="https://www.instagram.com/bravo_cafe_luxembourg/" target="_blank" rel="noopener noreferrer" style={odkazStyle}>Instagram</a>
        <a href="https://share.google/Ch9TWlQZ4HTd6gRpP" target="_blank" rel="noopener noreferrer" style={odkazStyle}>Google</a>
        <NavigujOdkaz style={odkazStyle} />
      </div>

      {/* 9) E-mail - řízený konstantou ZOBRAZIT_EMAIL */}
      {ZOBRAZIT_EMAIL && (
        <p style={{margin:"14px 20px 0",textAlign:"center",fontSize:"13px"}}>
          <a href={`mailto:${EMAIL}`} style={{color:"#b8954a",textDecoration:"none"}}>{EMAIL}</a>
        </p>
      )}

      {/* 7) Jemné "... a brzy přijde víc" - sjednocená barva #6f6253 */}
      <p style={{margin:"16px 20px 0",textAlign:"center",fontSize:"12px",color:"#6f6253",letterSpacing:"0.02em"}}>
        … a brzy přijde víc 😌
      </p>

      {/* 5) Nenápadný vstup pro majitele - posunutý níž */}
      <div style={{marginTop:"56px",textAlign:"center"}}>
        <a href="/login" style={{fontSize:"11px",color:"#b6ab9b",textDecoration:"none",letterSpacing:"0.04em"}}>Vstup pro majitele</a>
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

      </WebObsahProvider>
    </main>
  );
}
