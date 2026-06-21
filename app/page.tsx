import KioskStatus from "./KioskStatus";
// Fáze 1: AuthBar a TrustCard zůstávají v projektu, na veřejné úvodní stránce se zatím nevykreslují.
// import AuthBar from "./AuthBar";
// import TrustCard from "./TrustCard";

// E-mail jde snadno skrýt/zobrazit touto jednou konstantou. Fáze 1: skrytý.
const ZOBRAZIT_EMAIL = false;
const EMAIL = "hello@bra-vo.com";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",background:"#f7f3ec",display:"flex",flexDirection:"column",paddingBottom:"32px",fontFamily:"Inter,sans-serif",width:"100%",maxWidth:"480px",margin:"0 auto"}}>

      {/* 1) Přepínač jazyků - zatím jen vizuální placeholder (nefunkční) */}
      <div style={{display:"flex",justifyContent:"flex-end",padding:"12px 20px 0"}}>
        <span style={{fontSize:"11px",letterSpacing:"0.1em",color:"#b6ab9b"}}>EN · FR · DE · LU · CS</span>
      </div>

      {/* 2) Hlavička */}
      <header style={{padding:"20px 20px 16px",textAlign:"center"}}>
        <h1 style={{fontSize:"32px",fontWeight:300,letterSpacing:"0.35em",color:"#1a1208",margin:0}}>BRAVO</h1>
        <p style={{fontSize:"12px",color:"#8a7f70",letterSpacing:"0.14em",marginTop:"6px"}}>místo k zastavení</p>
      </header>

      {/* 3) Placeholder pro foto/logo kiosku */}
      <div style={{margin:"4px 16px 0",height:"170px",background:"#efe9df",border:"1px dashed #d8cdbb",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:"12px",letterSpacing:"0.12em",color:"#b6ab9b"}}>foto / logo</span>
      </div>

      {/* 4) Vlídné vysvětlení provozu (text, ne tlačítko) */}
      <p style={{margin:"18px 20px 0",fontSize:"13px",lineHeight:1.7,color:"#6b6057",textAlign:"center"}}>
        Otevírací doba je přibližná a závisí na počasí. Než vyrazíš za BRAVEM, vždy se podívej na aktuální stav, ať mě tu najdeš. Děkuji za pochopení.
      </p>

      {/* 5) Stav kiosku + počasí */}
      <div style={{margin:"18px 16px 0",background:"white",borderRadius:"16px",border:"0.5px solid rgba(0,0,0,0.08)",overflow:"hidden"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",borderBottom:"0.5px solid rgba(0,0,0,0.06)"}}>
          <div>
            <p style={{fontSize:"9px",letterSpacing:"0.15em",color:"#8a7f70",margin:"0 0 6px"}}>PRÁVĚ TEĎ</p>
            <KioskStatus />
            <p style={{fontSize:"11px",color:"#8a7f70",margin:"8px 0 0"}}>Zítra: pravděpodobně otevřeno</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:"22px",margin:0}}>⛅</p>
            <p style={{fontSize:"11px",color:"#8a7f70",margin:0}}>22 °C</p>
          </div>
        </div>
        <div style={{padding:"8px 16px",background:"rgba(251,191,36,0.08)"}}>
          <p style={{fontSize:"11px",color:"#92400e",margin:0}}>Zítra: 18 °C · možný déšť</p>
        </div>
      </div>

      {/* 6) Krátký popis kurzívou - tichý dotyk */}
      <div style={{margin:"20px 20px 0",textAlign:"center"}}>
        <p style={{fontSize:"13px",lineHeight:1.8,color:"#8a7f70",fontStyle:"italic",margin:0}}>
          Speciální káva, čaj, květiny a klasická hudba.<br/>
          Nápoje laděné na míru, podle tvé chuti.<br/>
          Pozvánka k zastavení v každém všedním dni.
        </p>
      </div>

      {/* 7) Placeholder tlačítko Nápojový lístek (zatím bez funkce) */}
      <div style={{margin:"22px 16px 0"}}>
        <button style={{width:"100%",background:"none",color:"#1a1208",border:"1px solid #d8cdbb",borderRadius:"12px",padding:"13px",fontSize:"13px",fontWeight:500,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
          Nápojový lístek
        </button>
      </div>

      {/* 8) Tři odkazy vedle sebe (zatím placeholdery) */}
      <div style={{margin:"18px 16px 0",display:"flex",gap:"8px"}}>
        {[{label:"Instagram",href:"#"},{label:"Google",href:"#"},{label:"Naviguj",href:"#"}].map(l => (
          <a key={l.label} href={l.href} style={{flex:1,textAlign:"center",padding:"11px 6px",borderRadius:"10px",border:"0.5px solid rgba(0,0,0,0.08)",background:"white",fontSize:"12px",color:"#1a1208",textDecoration:"none"}}>
            {l.label}
          </a>
        ))}
      </div>

      {/* 9) E-mail - řízený konstantou ZOBRAZIT_EMAIL */}
      {ZOBRAZIT_EMAIL && (
        <p style={{margin:"18px 20px 0",textAlign:"center",fontSize:"13px"}}>
          <a href={`mailto:${EMAIL}`} style={{color:"#b8954a",textDecoration:"none"}}>{EMAIL}</a>
        </p>
      )}

      {/* 10) Jemné "Brzy přijde víc." */}
      <p style={{margin:"24px 20px 0",textAlign:"center",fontSize:"12px",color:"#b6ab9b",letterSpacing:"0.04em"}}>
        Brzy přijde víc.
      </p>

      {/* 11) Nenápadný vstup pro majitele */}
      <div style={{marginTop:"28px",textAlign:"center"}}>
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

    </main>
  );
}
